import { ArtistClassDto } from '../dto';
import { Artist } from '../entities';
import { ArtistClass } from '../entities/artist-class.entity';
import { Repository } from 'typeorm';
export declare class ArtistClassesService {
    private readonly artistClassesRepository;
    private readonly artistRepository;
    constructor(artistClassesRepository: Repository<ArtistClass>, artistRepository: Repository<Artist>);
    createArtistClasses(eventId: string, artistClassDto: ArtistClassDto[]): Promise<void>;
    getArtistClasses(eventId: string): Promise<string[]>;
    deleteArtistClasses(eventId: string): Promise<void>;
}
