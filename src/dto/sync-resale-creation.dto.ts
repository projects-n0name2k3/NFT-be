import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SyncResaleCreationDto {
  @IsString()
  @IsNotEmpty()
  blockNumber: string;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  eventData: string;

  @IsString()
  @IsNotEmpty()
  saleId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  seller: string;

  @IsString()
  @IsNotEmpty()
  ticketAddress: string;

  @IsString()
  @IsNotEmpty()
  ticketTier: string;

  @IsString()
  @IsNotEmpty()
  paymentTokenAddress: string;

  @IsNumber()
  @IsNotEmpty()
  pricePerTicket: number;

  @IsNumber()
  @IsNotEmpty()
  initialQuantity: number;
}
