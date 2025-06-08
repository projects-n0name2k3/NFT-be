import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Request, Response, CookieOptions } from 'express';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { verifyMessage } from 'ethers';
import { MailService } from './mail.service';
import { RefreshToken, User, OrganizerDetail } from '../entities';
import { UserRole } from '../entities/user.entity';
import {
  VerifyDto,
  VerifyEmailDto,
  VerifyOrganizerDto,
  VerifyWalletDto,
  TokenPayloadDto,
} from '../dto';
import { SCService } from './sc.service';
@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;
  private readonly cookieConfig: CookieOptions;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly scService: SCService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganizerDetail)
    private readonly organizerDetailRepository: Repository<OrganizerDetail>,
  ) {
    this.accessTokenSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshTokenSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessTokenTtl =
      this.configService.getOrThrow<number>('ACCESS_TOKEN_TTL');
    this.refreshTokenTtl =
      this.configService.getOrThrow<number>('REFRESH_TOKEN_TTL');
    this.cookieConfig = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };
  }

  private async generateNonce(): Promise<string> {
    //create nonce
    const nonce = uuid();
    //save it in cache
    await this.cacheManager.set(
      `nonce:${nonce}`,
      nonce,
      this.configService.getOrThrow<number>('NONCE_TTL'),
    );
    return nonce;
  }

  async generateMessage(walletAddress: string): Promise<string> {
    //create nonce using uuid and timestamp
    const nonce = await this.generateNonce();
    //create message
    const message = `Welcome! To verify ownership of your wallet, please sign this message.\n\nWallet Address: ${walletAddress}\nNonce: ${nonce}\n\nThis request is intended for authentication purposes only and does not initiate any blockchain transaction.\nPlease verify the details carefully before signing.\n\nNote: This message will expire in 2 minutes. Please sign it within this timeframe.`;
    return message;
  }

  private async encodeAccessToken(
    walletAddress: string,
    userId: string,
    role: UserRole,
  ): Promise<string> {
    try {
      const token = await this.jwtService.signAsync(
        { walletAddress, userId, role },
        { secret: this.accessTokenSecret, expiresIn: this.accessTokenTtl },
      );
      return token;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Unable to generate access token');
    }
  }

  private async encodeRefreshToken(
    walletAddress: string,
    userId: string,
    role: UserRole,
  ): Promise<string> {
    try {
      //create refresh token
      const token = await this.jwtService.signAsync(
        { walletAddress, userId, role },
        { secret: this.refreshTokenSecret, expiresIn: this.refreshTokenTtl },
      );

      //save to db
      const refreshToken = await this.refreshTokenRepository.create({
        user: { id: userId } as User,
        token,
        expiredAt: new Date(Date.now() + this.refreshTokenTtl),
      });
      await this.refreshTokenRepository.save(refreshToken);

      return token;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Unable to generate refresh token');
    }
  }

  async decodeRefreshToken(token: string): Promise<TokenPayloadDto> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });
      return payload;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async signOut(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (refreshToken) {
      try {
        const payload: TokenPayloadDto =
          await this.decodeRefreshToken(refreshToken);
        await this.refreshTokenRepository.update(
          { user: { id: payload.userId }, token: refreshToken },
          { isRevoked: true },
        );
      } catch (error) {
        console.log(error);
      }
    }

    res.clearCookie('access_token', {
      ...this.cookieConfig,
      maxAge: 0,
    });
    res.clearCookie('refresh_token', {
      ...this.cookieConfig,
      maxAge: 0,
    });
    res.json({
      status: HttpStatus.OK,
      message: 'Logout successfully',
    });
  }

  async refreshToken(req: Request, res: Response) {
    //get refresh token from cookie
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token is required');
    }

    //verify to get payload
    const payload: TokenPayloadDto =
      await this.decodeRefreshToken(refreshToken);

    //check on db
    const storedRefreshToken: RefreshToken | null =
      await this.refreshTokenRepository.findOne({
        where: {
          user: { id: payload.userId },
          token: refreshToken,
          isRevoked: false,
        },
      });

    if (!storedRefreshToken || storedRefreshToken.expiredAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    //create new access token
    const newAccessToken = await this.encodeAccessToken(
      payload.walletAddress,
      payload.userId,
      payload.role,
    );

    //check token rotation
    const enableTokenRotation = this.configService.getOrThrow<boolean>(
      'ENABLE_TOKEN_ROTATION',
    );
    let newRefreshToken: string | undefined;

    if (enableTokenRotation) {
      newRefreshToken = await this.encodeRefreshToken(
        payload.walletAddress,
        payload.userId,
        payload.role,
      );

      //mark old refresh token is revoked
      await this.refreshTokenRepository.update(storedRefreshToken.id, {
        isRevoked: true,
      });
    }

    //set cookie for new access token
    res.cookie('access_token', newAccessToken, {
      ...this.cookieConfig,
      maxAge: this.accessTokenTtl,
    });

    //set cookie for new refresh token
    if (newRefreshToken) {
      res.cookie('refresh_token', newRefreshToken, {
        ...this.cookieConfig,
        maxAge: this.refreshTokenTtl,
      });
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Access token refreshed successfully',
    });
  }

  async verifyUser(body: VerifyWalletDto, res: Response) {
    console.log(body);
    let signerAddress = '';
    try {
      signerAddress = verifyMessage(body.message, body.signature);
    } catch (error) {
      throw new BadRequestException('Invalid Signature');
    }
    if (signerAddress.toLowerCase() !== body.walletAddress.toLowerCase()) {
      throw new BadRequestException('Invalid Signature');
    }

    let user = await this.userRepository.findOne({
      where: { walletAddress: body.walletAddress },
    });

    if (!user) {
      user = this.userRepository.create({
        walletAddress: body.walletAddress,
        thumbnailUrl: '',
        coverPhotoUrl: '',
      });

      await this.userRepository.save(user);
    }

    const accessToken = await this.encodeAccessToken(
      user.walletAddress,
      user.id,
      user.role,
    );
    const refreshToken = await this.encodeRefreshToken(
      user.walletAddress,
      user.id,
      user.role,
    );

    res.cookie('access_token', accessToken, {
      ...this.cookieConfig,
      maxAge: this.accessTokenTtl,
    });

    res.cookie('refresh_token', refreshToken, {
      ...this.cookieConfig,
      maxAge: this.refreshTokenTtl,
    });

    let organizerData: OrganizerDetail | null = null;
    if (user.role === UserRole.ORGANIZER) {
      organizerData = await this.organizerDetailRepository.findOne({
        where: { user: { id: user.id } },
      });
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Verification successfully',
      data: {
        user: { ...user, ...organizerData },
      },
    });
  }

  async sendOtp(body: VerifyDto, res: Response) {
    let user = await this.userRepository.findOne({
      where: { walletAddress: body.walletAddress },
    });

    let organizer = await this.organizerDetailRepository.findOne({
      where: { email: body.email },
    });

    if (organizer) {
      throw new ConflictException('Email has been used');
    }

    if (user) {
      if (user.role == UserRole.ORGANIZER) {
        throw new ConflictException(
          'Wallet address is registerd . Please sign in',
        );
      }
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #333;">🔐 One-Time Password (OTP) Verification</h2>
            <p>Dear user,</p>
            <p>You recently requested a One-Time Password (OTP) to verify your identity. Please use the code below to proceed:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0;">
                ${otp}
            </div>
            <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
            <hr>
            <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>`;

    this.mailService.sendEmail(otp, html, body.email);
    const key = `otp_${body.walletAddress}_${body.email}`;
    await this.cacheManager.del(key);

    await this.cacheManager.set(
      key,
      otp,
      this.configService.getOrThrow<number>('OTP_CACHE_TTL'),
    );

    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Sent otp successfully',
    });
  }

  async verifyWalletOrganizer(body: VerifyOrganizerDto, res: Response) {
    // let signerAddress = '';
    // try {
    //   signerAddress = verifyMessage(body.message, body.signature);
    // } catch (error) {
    //   throw new BadRequestException('Invalid Signature');
    // }
    // if (signerAddress.toLowerCase() !== body.walletAddress.toLowerCase()) {
    //   throw new BadRequestException('Invalid Signature');
    // }

    const keyStatus = `status_${body.walletAddress}_${body.email}`;

    const isSuccessVerify = await this.cacheManager.get(keyStatus);
    if (true) {
      let user = await this.userRepository.findOne({
        where: { walletAddress: body.walletAddress },
      });

      if (user?.role === UserRole.USER) {
        let organizer = this.organizerDetailRepository.create({
          email: body.email,
          user: { id: user.id } as User,
        });
        await this.organizerDetailRepository.save(organizer);

        user.role = UserRole.ORGANIZER;
        user = await this.userRepository.save(user);
      } else if (!user) {
        user = this.userRepository.create({
          walletAddress: body.walletAddress,
          thumbnailUrl: '',
          coverPhotoUrl: '',
          role: UserRole.ORGANIZER,
        });

        const userData = await this.userRepository.save(user);
        const organizer = this.organizerDetailRepository.create({
          email: body.email,
          user: { id: userData.id } as User,
        });
        await this.organizerDetailRepository.save(organizer);
      }

      try {
        await this.scService.addOrganizerWalletAddressToWhitelist(
          body.walletAddress,
        );
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(
          'Failed to add organizer to whitelist',
        );
      }

      const accessToken = await this.encodeAccessToken(
        user.walletAddress,
        user.id,
        UserRole.ORGANIZER,
      );
      const refreshToken = await this.encodeRefreshToken(
        user.walletAddress,
        user.id,
        UserRole.ORGANIZER,
      );

      res.cookie('access_token', accessToken, {
        ...this.cookieConfig,
        maxAge: this.accessTokenTtl,
      });
      res.cookie('refresh_token', refreshToken, {
        ...this.cookieConfig,
        maxAge: this.refreshTokenTtl,
      });

      const userData = await this.userRepository.findOne({
        where: { walletAddress: body.walletAddress },
      });
      const organizerData = await this.organizerDetailRepository.findOne({
        where: { user: { id: userData?.id } },
      });
      console.log(organizerData);

      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Verification wallet successfully',
        data: {
          user: { ...userData, ...organizerData },
        },
      });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Please verify otp',
      });
    }
  }

  async verifyEmail(body: VerifyEmailDto, res: Response) {
    try {
      const key = `otp_${body.walletAddress}_${body.email}`;
      const cachedOtp = await this.cacheManager.get(key);
      let isSuccess = false;
      if (cachedOtp === body.code) {
        isSuccess = true;
        res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: 'Email is verified successfully',
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid OTP',
        });
      }
      const keyStatus = `status_${body.walletAddress}_${body.email}`;

      await this.cacheManager.del(keyStatus);
      await this.cacheManager.set(
        keyStatus,
        isSuccess,
        this.configService.getOrThrow<number>('OTP_CACHE_TTL'),
      );
      return res;
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
}
