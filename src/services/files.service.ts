import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as toStream from 'buffer-to-stream';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUNDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const result: Promise<UploadApiResponse> = new Promise(
      (resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: this.configService.getOrThrow<string>('CLOUNDINARY_FOLDER'),
          },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        toStream(file.buffer).pipe(upload);
      },
    );

    return (await result).url;
  }

  async deleteImage(url: string): Promise<{ result: string }> {
    const publicId: string = this.extractPublicIdFromUrl(url);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error: UploadApiErrorResponse, result: { result: string }) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  private extractPublicIdFromUrl(url: string): string {
    // Ví dụ URL: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/files/sample_image.jpg
    const filename = url
      .split(this.configService.getOrThrow<string>('CLOUNDINARY_FOLDER'))[1]
      .replace('/', '')
      .split('.')[0];

    return `${this.configService.getOrThrow<string>('CLOUNDINARY_FOLDER')}/${filename}`;
  }
}
