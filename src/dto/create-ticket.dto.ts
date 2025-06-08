import { IsNotEmpty, IsString } from 'class-validator';

export class TicketDto {
    @IsNotEmpty({ message: 'quantity is not empty' })
    @IsString({ message: 'quantity is must be number' })
    quantity: number;
}
