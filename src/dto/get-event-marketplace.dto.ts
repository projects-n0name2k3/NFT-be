import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetEventMarketplaceDto {
  @IsOptional()
  @IsString()
  value: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  limit: number;

  @Transform(({ value }) => new Date(value))
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Transform(({ value }) => new Date(value))
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
