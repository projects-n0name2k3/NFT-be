import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { VerifyWalletDto } from './validate-wallet.dto';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOrganizerDto extends VerifyWalletDto {
  @ApiProperty({
    example: 'tranngochuy1234a@gmail.com',
    description: "User's email address",
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
