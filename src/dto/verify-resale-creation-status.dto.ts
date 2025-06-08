import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class VerifyResaleCreationStatusDto {
  @ApiProperty({
    description: 'Event id',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @ApiProperty({
    description: 'Ticket tier',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  ticketTier: number;

  @ApiProperty({
    description: 'Price per ticket',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  pricePerTicket: number;

  @ApiProperty({
    description: 'Amount',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Transaction hash',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'transactionHash is invalid.',
  })
  transactionHash: string;
}
