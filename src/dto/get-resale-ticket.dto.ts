import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
export class GetResaleTicketDto {
    @ApiProperty({
        description: 'Number of items to take for pagination',
        required: false,
    })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number;

    @ApiProperty({
        description: 'Page number for pagination',
        required: false,
    })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

}
