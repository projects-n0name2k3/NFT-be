import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { Request, Response } from 'express';
import {
  GenerateMessageDto,
  VerifyDto,
  VerifyEmailDto,
  VerifyOrganizerDto,
  VerifyWalletDto,
} from '../dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Generate a unique message' })
  @ApiResponse({
    status: 200,
    description: 'Message generated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Generate message successfully',
        data: `Welcome! To verify ownership of your wallet, please sign this message.\n\nWallet Address: 0x1234567890abcdef1234567890abcdef12345678\nNonce: bcd02c5e-6f25-4c9a-8c15-4f2f57f7e3d7\n\nThis request is intended for authentication purposes only and does not initiate any blockchain transaction.\nPlease verify the details carefully before signing.\n\nNote: This message will expire in 2 minutes. Please sign it within this timeframe.`,
      },
    },
  })
  @Get('message/:walletAddress')
  @HttpCode(HttpStatus.OK)
  async generateMessage(@Param() { walletAddress }: GenerateMessageDto) {
    const result = {
      status: HttpStatus.OK,
      message: 'Generate message successfully',
      data: {
        message: await this.authService.generateMessage(walletAddress),
      },
    };
    return result;
  }

  @ApiOperation({ summary: 'Log out the current user' })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.signOut(req, res);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Refresh Token is required - Refresh token is invalid or expired',
  })
  @Post('tokens')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    await this.authService.refreshToken(req, res);
  }

  @ApiOperation({ summary: 'Verify wallet for user role' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Verify wallet successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid Signature',
  })
  @Post('wallet/user/verification')
  async verifyUser(@Body() body: VerifyWalletDto, @Res() res: Response) {
    await this.authService.verifyUser(body, res);
  }

  @ApiOperation({ summary: 'Verify wallet for organizer role' })
  @ApiResponse({
    status: 200,
    description: 'Verify wallet successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid Signature',
  })
  @HttpCode(HttpStatus.OK)
  @Post('wallet/organizer/verification')
  async verifyOrganizer(
    @Body() body: VerifyOrganizerDto,
    @Res() res: Response,
  ) {
    await this.authService.verifyWalletOrganizer(body, res);
  }

  @ApiOperation({ summary: 'Verify email for creating organizer' })
  @ApiResponse({
    status: 200,
    description: 'Verify email successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP',
  })
  @Post('email/organizer/verification')
  async verifyEmail(@Body() body: VerifyEmailDto, @Res() res: Response) {
    await this.authService.verifyEmail(body, res);
  }

  @ApiOperation({ summary: 'Send OTP for creating organizer' })
  @ApiResponse({
    status: 200,
    description: 'Send OTP successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email has been used',
  })
  @Post('otp/organizer/verification')
  async sendOtp(@Body() body: VerifyDto, @Res() res: Response) {
    await this.authService.sendOtp(body, res);
  }
}
