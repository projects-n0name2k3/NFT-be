import { Artist } from '../entities/artist.entity';
import { Repository } from 'typeorm';
export declare class ArtistsService {
    private readonly artistsRepository;
    constructor(artistsRepository: Repository<Artist>);
    deleteArtists(classIds: string[]): Promise<void>;
}
