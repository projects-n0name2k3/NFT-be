import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenPayloadDto, UpdateOrganizerDto } from '../dto';
import { UsersService } from './users.service';
import { OrganizerDetail } from '../entities';
@Injectable()
export class OrganizerDetailsService {
  constructor(
    @InjectRepository(OrganizerDetail)
    private readonly organizerDetailRepository: Repository<OrganizerDetail>,
    private readonly usersService: UsersService,
  ) {}

  async updateOrganizerInformation(
    user: TokenPayloadDto,
    files: {
      coverImage?: Express.Multer.File[];
      thumbnailImage?: Express.Multer.File[];
    },
    payload: UpdateOrganizerDto,
  ) {
    //update user details
    const updatedUser = await this.usersService.updateUser(
      user,
      files,
      payload.name,
    );

    //update organizer details
    const organizerDetail = await this.organizerDetailRepository.findOne({
      where: {
        user: { id: user.userId },
      },
    });

    if (!organizerDetail) {
      throw new NotFoundException('Organizer detail not found');
    }

    const {
      phoneNumber,
      bio,
      facebookLink,
      telegramLink,
      instagramLink,
      xLink,
      discordLink,
      websiteLink,
    } = payload;

    organizerDetail.phoneNumber = phoneNumber;
    organizerDetail.bio = bio;
    organizerDetail.facebookLink = facebookLink;
    organizerDetail.telegramLink = telegramLink;
    organizerDetail.instagramLink = instagramLink;
    organizerDetail.xLink = xLink;
    organizerDetail.discordLink = discordLink;
    organizerDetail.websiteLink = websiteLink;

    const updatedOrganizerDetail =
      await this.organizerDetailRepository.save(organizerDetail);

    return { updatedUser, updatedOrganizerDetail };
  }

  async getOrganizerProfile(user: TokenPayloadDto) {
    //get organizer details
    const organizerProfile = await this.organizerDetailRepository.findOne({
      where: { user: { id: user.userId } },
    });

    if (!organizerProfile) {
      throw new NotFoundException('Organizer detail not found');
    }

    //get user details
    const userProfile = await this.usersService.getUserProfile(user);

    return { ...organizerProfile, ...userProfile };
  }
}
