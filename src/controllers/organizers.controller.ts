import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrganizerDetailsService } from '../services';
import { User } from 'src/common/decorators/user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateOrganizerDto, TokenPayloadDto } from 'src/dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/entities/user.entity';
import { UpdateProfileFileValidationPipe } from 'src/common/pipes/update-profile-file-validation.pipe';

@ApiTags('Organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(
    private readonly organizerDetailsService: OrganizerDetailsService,
  ) {}

  @ApiOperation({ summary: 'Update organizer information' })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated organizer information successfully.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coverPhotoImage: { type: 'buffer' },
        thumbnailImage: { type: 'buffer' },
        phoneNumber: { type: 'string' },
        bio: { type: 'string' },
        facebookLink: { type: 'string' },
        telegramLink: { type: 'string' },
        instagramLink: { type: 'string' },
        xLink: { type: 'string' },
        discordLink: { type: 'string' },
        websiteLink: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Unprocessable Entity',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated organizer information successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organizer detail not found',
  })
  @UseGuards(JwtGuard, RoleGuard)
  @Put('profile')
  @Role(UserRole.ORGANIZER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverPhotoImage', maxCount: 1 },
      {
        name: 'thumbnailImage',
        maxCount: 1,
      },
    ]),
  )
  async updateOrganizerInformation(
    @User() user: TokenPayloadDto,
    @UploadedFiles(new UpdateProfileFileValidationPipe())
    files: {
      coverPhotoImage?: Express.Multer.File[];
      thumbnailImage?: Express.Multer.File[];
    },
    @Body() payload: UpdateOrganizerDto,
  ) {
    const { updatedUser, updatedOrganizerDetail } =
      await this.organizerDetailsService.updateOrganizerInformation(
        user,
        files,
        payload,
      );

    return {
      status: HttpStatus.OK,
      message: 'Updated organizer information successfully.',
      data: { user: { ...updatedUser, ...updatedOrganizerDetail } },
    };
  }

  @ApiOperation({ summary: 'Get organizer profile' })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get organizer profile successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organizer not found',
  })
  @UseGuards(JwtGuard, RoleGuard)
  @Get('profile')
  @Role(UserRole.ORGANIZER)
  async getOrganizerProfile(@User() user: TokenPayloadDto) {
    const organizerProfile =
      await this.organizerDetailsService.getOrganizerProfile(user);
    return {
      status: HttpStatus.OK,
      message: 'Get organizer profile successfully.',
      data: { user: organizerProfile },
    };
  }
}
