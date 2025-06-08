import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class TicketTierDto {
  @IsNotEmpty({ message: 'name of ticketTiers is not empty' })
  @IsString({ message: 'name of ticketTiers is must be string' })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  royaltyTicketTier: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  maxResalePrice: number;

  @IsOptional()
  @IsNumber()
  minResalePrice: number;

  @IsNotEmpty()
  @IsString()
  description: string;
}
