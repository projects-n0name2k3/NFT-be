import { IsString, IsOptional, IsInt, Min, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class SearchEventDto {
  @ApiProperty({
    description: 'Event name to search for',
    required: false,
  })
  @IsString()
  @IsOptional()
  value?: string;

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

  @ApiProperty({
    description: 'Minimum price to search for',
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price to search for',
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({
    description: 'Start date to search for (in milliseconds since epoch)',
    required: false,
    example: 1742374259984,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  startDate?: number;

  @ApiProperty({
    description: 'End date to search for (in milliseconds since epoch)',
    required: false,
    example: 1742374259984,
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  endDate?: number;
}
