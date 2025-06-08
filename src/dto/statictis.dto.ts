import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TimePeriod {
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export class GetStatisticsDto {
  @IsEnum(TimePeriod)
  type: TimePeriod;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
