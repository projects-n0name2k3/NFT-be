import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities';
import { TokenPayloadDto } from 'src/dto';
import { FilesService } from './files.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly filesService: FilesService,
  ) {}

  async updateUser(
    tokenPayload: TokenPayloadDto,
    files: {
      coverPhotoImage?: Express.Multer.File[];
      thumbnailImage?: Express.Multer.File[];
    } = {},
    name?: string,
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: tokenPayload.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const [coverPhotoUrl, thumbnailUrl] = await Promise.all([
        files.coverPhotoImage &&
          (await this.filesService.uploadImage(files.coverPhotoImage[0])),
        files.thumbnailImage &&
          (await this.filesService.uploadImage(files.thumbnailImage[0])),
      ]);

      user.coverPhotoUrl = coverPhotoUrl || user.coverPhotoUrl;
      user.thumbnailUrl = thumbnailUrl || user.thumbnailUrl;
      user.name = name || user.name;
      const updatedUser = await this.userRepository.save(user);

      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async getUserProfile(user: TokenPayloadDto) {
    const userProfile: User | null = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!userProfile) {
      throw new NotFoundException('User not found');
    }

    return userProfile;
  }
}
