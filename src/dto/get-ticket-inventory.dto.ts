import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';

import { IsNumber } from 'class-validator';

export enum SortType {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetTicketsByUserDto {
  @ApiProperty({
    description: 'The number of tickets to skip',
    required: false,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit: number;

  @ApiProperty({
    description: 'The page number',
    required: false,
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;
  @ApiProperty({
    description: 'The type of sorting',
    required: false,
    enum: SortType,
  })
  @IsEnum(SortType)
  @IsOptional()
  sortType: SortType;


  @ApiProperty({
    description: 'The name of event',
    required: false,
  })
  @IsString()
  @IsOptional()
  value: string;
}
