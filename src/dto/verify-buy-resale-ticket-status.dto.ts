import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class VerifyBuyResaleTicketStatusDto {
  @ApiProperty({
    description: 'Sale ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  saleId: number;

  @ApiProperty({
    description: 'Amount',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Transaction hash',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'transactionHash must be a valid Ethereum address',
  })
  transactionHash: string;
}
