import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from '../entities/artist.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistsRepository: Repository<Artist>,
  ) {}

  async deleteArtists(classIds: string[]) {
    const artists = await this.artistsRepository.find({
      where: { artistClass: In(classIds) },
    });

    if (!artists) {
      return;
    }

    await Promise.all(
      artists.map((artist) => {
        this.artistsRepository.delete(artist.id);
      }),
    );
  }
}
