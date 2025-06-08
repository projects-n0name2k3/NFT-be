import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetEventDetailsDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}
