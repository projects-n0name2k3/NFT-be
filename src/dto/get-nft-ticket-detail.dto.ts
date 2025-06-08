import { IsNotEmpty, IsString } from 'class-validator';

export class GetNftTicketDetailDto {
  @IsString()
  @IsNotEmpty()
  nftTicketId: string;
}
