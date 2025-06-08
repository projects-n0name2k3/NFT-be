import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class UpdateOrganizerDto {
  @ApiProperty({
    description: 'The phone number of the organizer',
    example: '+1234567890',
  })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    description: 'The bio of the organizer',
    example: 'I am a organizer',
  })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    description: 'The facebook link of the organizer',
    example: 'https://www.facebook.com/organizer',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  facebookLink: string;

  @ApiProperty({
    description: 'The telegram link of the organizer',
    example: 'https://t.me/organizer',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  telegramLink: string;

  @ApiProperty({
    description: 'The instagram link of the organizer',
    example: 'https://www.instagram.com/organizer',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  instagramLink: string;

  @ApiProperty({
    description: 'The x link of the organizer',
    example: 'https://x.com/organizer',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  xLink: string;

  @ApiProperty({
    description: 'The discord link of the organizer',
    example: 'https://discord.com/organizer',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  discordLink: string;

  @ApiProperty({
    description: 'The website link of the organizer',
    example: 'https://www.organizer.com',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl()
  websiteLink: string;

  @ApiProperty({
    description: 'The name of the organizer',
    example: 'Organizer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
