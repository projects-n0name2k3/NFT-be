import { Repository } from 'typeorm';
import { User } from '../entities';
import { TokenPayloadDto } from '../dto';
import { FilesService } from './files.service';
export declare class UsersService {
    private readonly userRepository;
    private readonly filesService;
    constructor(userRepository: Repository<User>, filesService: FilesService);
    updateUser(tokenPayload: TokenPayloadDto, files?: {
        coverPhotoImage?: Express.Multer.File[];
        thumbnailImage?: Express.Multer.File[];
    }, name?: string): Promise<User>;
    getUserProfile(user: TokenPayloadDto): Promise<User>;
}
