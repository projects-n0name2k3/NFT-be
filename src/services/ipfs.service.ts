import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class IpfsService {
  private readonly pinataApiUrl =
    'https://api.pinata.cloud/pinning/pinFileToIPFS';
  private readonly pinataJwt;
  private readonly httpService: HttpService;
  constructor(private readonly configService: ConfigService) {
    this.pinataJwt = this.configService.get<string>('PINATA_JWT');
    this.httpService = new HttpService();
  }

  async uploadMetadata(metadata: any): Promise<string> {
    try {
      const metadataJSON = JSON.stringify(metadata);
      const form = new FormData();
      form.append('file', metadataJSON, 'metadata.json');

      const response = await firstValueFrom(
        this.httpService.post(this.pinataApiUrl, form, {
          headers: {
            Authorization: `Bearer ${this.pinataJwt}`,
            ...form.getHeaders(),
          },
        }),
      );

      const cid = response.data.IpfsHash;
      return `https://ipfs.io/ipfs/${cid}`;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Upload metadata failed');
    }
  }

  async getMetadata(metadataUrl: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(metadataUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)', // Giả lập trình duyệt
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Get metadata failed');
    }
  }
}
