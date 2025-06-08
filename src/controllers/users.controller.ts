import {
  Controller,
  Get,
  HttpStatus,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { UsersService } from '../services';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto, TokenPayloadDto } from 'src/dto';
import { UpdateProfileFileValidationPipe } from 'src/common/pipes/update-profile-file-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Update user information' })
  @ApiCookieAuth('access_token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        coverPhotoImage: { type: 'buffer' },
        thumbnailImage: { type: 'buffer' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated user information successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Unprocessable Entity',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @UseGuards(JwtGuard)
  @Put('profile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverPhotoImage', maxCount: 1 },
      {
        name: 'thumbnailImage',
        maxCount: 1,
      },
    ]),
  )
  async updateUser(
    @User() user: TokenPayloadDto,
    @UploadedFiles(new UpdateProfileFileValidationPipe())
    files: {
      coverPhotoImage?: Express.Multer.File[];
      thumbnailImage?: Express.Multer.File[];
    } = {},
    @Body() { name }: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(user, files, name);
    return {
      status: HttpStatus.OK,
      message: 'Updated user successfully.',
      data: { updatedUser },
    };
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @UseGuards(JwtGuard)
  @Get('profile')
  async getUserProfile(@User() user: TokenPayloadDto) {
    const userProfile = await this.usersService.getUserProfile(user);
    return {
      status: HttpStatus.OK,
      message: 'Get user profile successfully.',
      data: { user: userProfile },
    };
  }
}
