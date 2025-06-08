import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ArtistClassDto } from '../dto/create-artist-class.dto';
import { TicketTierDto } from './create-ticket-tier.dto';
import { DateOrderConstraint } from '../common/validators/date-order.constraint';

export class PublishEventDto {
  @ApiProperty({
    description: 'Event name',
    example: 'Concert ABC',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Venue of event',
    example: 'TP building',
  })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty({
    description: 'Start day for sell',
    example: '2025-04-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  @Validate(DateOrderConstraint)
  sellStartDate: string;

  @ApiProperty({
    description: 'End day for sell',
    example: '2025-04-30T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  sellEndDate: string;

  @ApiProperty({
    description: 'Start day for event',
    example: '2025-05-15T18:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  eventStartDate: string;

  @ApiProperty({
    description: 'End day of event',
    example: '2025-05-15T22:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  eventEndDate: string;

  @ApiProperty({
    description: 'Description of event',
    example: 'Music night with top artists..',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Detailed location',
    example: 'District 1, Ho Chi Minh City 0.000000 0.000000',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsNumber()
  maxPerUser: number;

  @IsArray({ message: 'ticketTiers must be an array' })
  @ArrayMinSize(1, { message: 'At least 1 ticket tier is required' })
  @ValidateNested({ each: true })
  @Type(() => TicketTierDto)
  ticketTiers: TicketTierDto[];

  @IsArray({ message: 'artistClasses must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ArtistClassDto)
  @ArrayMinSize(1, { message: 'At least 1 artist class.' })
  artistClasses: ArtistClassDto[];

  @IsString()
  @IsNotEmpty()
  thumbnailUrl: string;

  @IsString()
  @IsNotEmpty()
  coverPhotoUrl: string;

  @IsString()
  @IsNotEmpty()
  seatmapUrl: string;
}
