import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<string>;
    deleteImage(url: string): Promise<{
        result: string;
    }>;
    private extractPublicIdFromUrl;
}
