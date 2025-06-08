import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyWalletDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @Length(10, 500, { message: 'Message must be between 10 and 500 characters' })
  @ApiProperty({
    example:
      'Welcome! To verify ownership of your wallet, please sign this message.',
    description: `Messages received by the user`,
  })
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'Signature is required' })
  @Length(65, 132, { message: 'Signature must be a valid signature' })
  @ApiProperty({
    example: `wvbcruhmtrdziyxhehsfrwduqdtrczfugkmiwwlbdbicouejmtwmxicbjzdrqqcwmtipfzhixczyzdkygmmgqpysfphwbyxtxgrnqrhsjtchwq`,
    description: '',
  })
  signature: string;

  @ApiProperty({
    example: `0xD435459d8C01d7C776B2e5C05e87EA289De65391`,
    description: 'wallet address',
  })
  @IsString()
  @IsNotEmpty({ message: 'Wallet address is required' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid wallet address',
  })
  walletAddress: string;
}
