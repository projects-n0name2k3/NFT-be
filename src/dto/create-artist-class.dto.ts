import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ArtistDto } from './create-artist.dto';

export class ArtistClassDto {
  @IsNotEmpty({ message: 'name of ArtistClass is not empty' })
  @IsString({ message: 'name of ArtistClass is must be string' })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  royaltyPercent: number;

  @ValidateNested({ each: true })
  @Type(() => ArtistDto)
  @ArrayMinSize(1, { message: 'At least 1 artist in artist class' })
  @IsArray({ message: 'artists must be an array' })
  artists: ArtistDto[];
}
