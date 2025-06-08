import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { VerifyWalletDto } from './validate-wallet.dto';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'tranngochuy1234a@gmail.com',
    description: "User's email address",
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'otp',
    description: 'OTP code of user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty({
    example: 'Wallet Address',
    description: 'Wallet Address code of user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Wallet address is required' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid wallet address',
  })
  walletAddress: string;
}
