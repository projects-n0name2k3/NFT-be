import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class VerifyResaleCancellationStatusDto {
  @IsNotEmpty()
  @IsNumber()
  saleId: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/)
  transactionHash: string;
}
