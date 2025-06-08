import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';


export enum SortType {
    ASC = 'asc',
    DESC = 'desc',
}

export class GetTicketsByTierDto {
    @ApiProperty({
        description: 'The page number',
        required: false,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsOptional()
    @IsNumber()
    page: number = 1;

    @ApiProperty({
        description: 'The number of tickets to skip',
        required: false,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit: number = 10;

    get skip(): number {
        return (this.page - 1) * this.limit;
    }

    @ApiProperty({
        description: 'The type of sorting',
        required: false,
        enum: SortType,
    })
    @IsEnum(SortType)
    @IsOptional()
    sortType: SortType = SortType.DESC;

    @ApiProperty({
        description: 'Id of ticket tier',
        required: true,
        type: String,
    })
    @IsUUID()
    @IsNotEmpty()
    tierId: string;
}
