import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ArtistDto {
  @IsNotEmpty({ message: 'name of Artist is not empty' })
  @IsString({ message: 'name of Artist is must be string' })
  name: string;

  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'walletAddress is invalid.',
  })
  walletAddress: string;
}
