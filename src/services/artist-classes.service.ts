import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtistClassDto } from 'src/dto';
import { Artist } from 'src/entities';
import { ArtistClass } from 'src/entities/artist-class.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArtistClassesService {
  constructor(
    @InjectRepository(ArtistClass)
    private readonly artistClassesRepository: Repository<ArtistClass>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) { }

  async createArtistClasses(eventId: string, artistClassDto: ArtistClassDto[]) {
    const artists: Artist[] = [];

    for (let i = 0; i < artistClassDto.length; i++) {
      const artistClass = this.artistClassesRepository.create({
        name: artistClassDto[i].name,
        event: { id: eventId },
        royaltyPercentage: artistClassDto[i].royaltyPercent,
      });

      const savedArtistClass =
        await this.artistClassesRepository.save(artistClass);

      const artistItem = artistClassDto[i].artists;
      for (let artistData of artistItem) {
        const artist = this.artistRepository.create({
          name: artistData.name,
          walletAddress: artistData.walletAddress,
          artistClass: { id: savedArtistClass.id },
        });
        artists.push(artist);
      }
      await this.artistRepository.save(artists);
    }
  }

  async getArtistClasses(eventId: string): Promise<string[]> {
    const artistClasses = await this.artistClassesRepository.find({
      where: { event: { id: eventId } },
      select: ['id'],
    });

    const artistClassIds = artistClasses.map((artistClass) => artistClass.id);
    return artistClassIds;
  }

  async deleteArtistClasses(eventId: string) {
    const artistClasses = await this.artistClassesRepository.find({
      where: { event: { id: eventId } },
    });

    if (!artistClasses) {
      return;
    }

    await Promise.all(
      artistClasses.map((artistClass) => {
        this.artistClassesRepository.delete(artistClass.id);
      }),
    );
  }
}
