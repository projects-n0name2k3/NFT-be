import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetTicketTierDetailsDto {
  @IsUUID()
  @IsNotEmpty()
  tierId: string;
}
