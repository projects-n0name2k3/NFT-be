import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { TokenPayloadDto } from '../../dto/token-payload.dto';

const cookieExtractor = (req: Request) => {
  if (req && req.cookies) {
    return req.cookies['access_token'];
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configSerivce: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: configSerivce.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: TokenPayloadDto) {
    return {
      userId: payload.userId,
      walletAddress: payload.walletAddress,
      role: payload.role,
    };
  }
}
