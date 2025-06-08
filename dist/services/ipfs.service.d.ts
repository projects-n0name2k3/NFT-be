import { ConfigService } from '@nestjs/config';
export declare class IpfsService {
    private readonly configService;
    private readonly pinataApiUrl;
    private readonly pinataJwt;
    private readonly httpService;
    constructor(configService: ConfigService);
    uploadMetadata(metadata: any): Promise<string>;
    getMetadata(metadataUrl: string): Promise<any>;
}
