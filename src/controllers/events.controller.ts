import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from 'src/common/decorators/role.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateEventFileValidationPipe } from 'src/common/pipes/create-event-file-validation.pipe';
import {
  CheckEventCreationStatusDto,
  CreateEventDraftDto,
  GetEventDetailsDto,
  SearchEventDto,
  TokenPayloadDto,
  GetEventMarketplaceDto,
  PublishEventDto,
} from 'src/dto';
import { SearchEventOrganizerDto } from 'src/dto/search-event-organizer.dto';
import { UserRole } from '../entities/user.entity';
import { EventsService } from '../services';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @ApiOperation({ summary: 'Search events for user' })
  @ApiConsumes('application/json')
  @ApiCookieAuth('access_token')
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'Page number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'Limit number',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date',
    required: false,
  })
  @ApiQuery({
    name: 'minPrice',
    type: 'number',
    description: 'Min price',
    required: false,
  })
  @ApiQuery({
    name: 'maxPrice',
    type: 'number',
    description: 'Max price',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search events successfully',
  })
  @Get()
  async searchEventsForUser(@Query() payload: SearchEventDto) {
    const result = await this.eventsService.searchEventsForUser(payload);
    return {
      status: HttpStatus.OK,
      message: 'Search events successfully',
      data: {
        ...result,
      },
    };
  }

  @ApiOperation({ summary: 'Create event as draft' })
  @UseGuards(JwtGuard, RoleGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Save event as draft successfully',
  })
  @ApiCookieAuth('access_token')
  @Post('save/draft')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailFile', maxCount: 1 },
      { name: 'coverPhotoFile', maxCount: 1 },
      { name: 'seatmapFile', maxCount: 1 },
    ]),
  )
  @Role(UserRole.ORGANIZER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnailFile: { type: 'string', format: 'binary' },
        coverPhotoFile: { type: 'string', format: 'binary' },
        seatmapFile: { type: 'string', format: 'binary' },
        payload: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'ABD' },
            venue: { type: 'string', example: 'TP building' },
            sellStartDate: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-01T00:00:00Z',
            },
            sellEndDate: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-30T23:59:59Z',
            },
            eventStartDate: {
              type: 'string',
              format: 'date-time',
              example: '2025-05-15T18:00:00Z',
            },
            eventEndDate: {
              type: 'string',
              format: 'date-time',
              example: '2025-05-15T22:00:00Z',
            },
            description: {
              type: 'string',
              example: 'Đêm nhạc rock hoành tráng!',
            },
            location: {
              type: 'string',
              example: 'District 1, Ho Chi Minh City 0.000000 0.000000',
            },
            maxPerUser: { type: 'number', example: 10 },
            ticketTiers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'VIP' },
                  price: { type: 'number', example: 1500000 },
                  quantity: { type: 'number', example: 100 },
                  royaltyTicketTier: { type: 'number', example: 20 },
                  maxResalePrice: { type: 'number', example: 10 },
                  minResalePrice: { type: 'number', example: 10 },
                  description: { type: 'string', example: 'abc' },
                },
                required: ['name', 'price', 'quantity'],
              },
            },
            artistClasses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Main Performers' },
                  royaltyPercentageArtist: { type: 'number', example: 30 },
                  artists: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Nguyễn Văn Rock' },
                        walletAddress: {
                          type: 'string',
                          example: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
                        },
                      },
                      required: ['name', 'walletAddress'],
                    },
                  },
                },
                required: ['name', 'royaltyPercentageArtist', 'artists'],
              },
            },
          },
          required: ['name', 'venue', 'sellStartDate', 'eventStartDate'],
        },
      },
    },
  })
  async saveEventDraft(
    @User() user: TokenPayloadDto,
    @UploadedFiles(new CreateEventFileValidationPipe())
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
    @Body() body: any,
  ) {
    const payload =
      await this.eventsService.parseArrayTicketTierAndArtistClass(body);
    await this.eventsService.saveEventsDraft(user, payload, files);
    return {
      status: HttpStatus.OK,
      message: 'Event is saved as draft successfully',
    };
  }

  @Put('update/draft/:eventId')
  @ApiOperation({ summary: 'Update event as draft' })
  @UseGuards(JwtGuard, RoleGuard)
  @Role(UserRole.ORGANIZER)
  @ApiCookieAuth('access_token')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailFile', maxCount: 1 },
      { name: 'coverPhotoFile', maxCount: 1 },
      { name: 'seatmapFile', maxCount: 1 },
    ]),
  )
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event ID' })
  async updateEventDraft(
    @User() user: TokenPayloadDto,
    @UploadedFiles()
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
    @Body() body: any,
    @Param() { eventId }: GetEventDetailsDto,
  ) {
    const payload =
      await this.eventsService.parseArrayTicketTierAndArtistClass(body);
    await this.eventsService.updateEventDraft(eventId, user, payload, files);
    return {
      status: HttpStatus.OK,
      message: 'Event is updated as draft successfully',
    };
  }

  @ApiOperation({ summary: 'Get upcoming event' })
  @UseGuards(JwtGuard)
  @ApiCookieAuth('access_token')
  @ApiConsumes('application/json')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get upcoming event successfully',
  })
  @Get('upcoming')
  async getUpcompingEvent() {
    const events = await this.eventsService.getUpcompingEvent();
    return {
      status: HttpStatus.OK,
      message: 'Get upcoming event successfully',
      data: {
        events,
      },
    };
  }

  @ApiOperation({
    summary:
      'Verify event information to get event metadata url before publishing',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary:
      'Verify event information to get event metadata URL before publishing',
  })
  @ApiCookieAuth('access_token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'object' },
        event: { type: 'object' },
        ticketTiers: { type: 'array' },
        artists: { type: 'array' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verify event information successfully',
    schema: {
      type: 'object',
      properties: {
        eventMetadataUrl: {
          type: 'string',
          description: 'URL of the event metadata stored on IPFS',
        },
        ticketMetadataUrl: {
          type: 'string',
          description: 'URL of the ticket metadata stored on IPFS',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid event information',
  })
  @Post('publish')
  @UseGuards(JwtGuard, RoleGuard)
  @Role(UserRole.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnailFile', maxCount: 1 },
      { name: 'coverPhotoFile', maxCount: 1 },
      { name: 'seatmapFile', maxCount: 1 },
    ]),
  )
  async verifyEventInformation(
    @User() user: TokenPayloadDto,
    @UploadedFiles()
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
    @Body()
    body: any,
  ) {
    let payload;

    if (
      typeof body.ticketTiers === 'string' ||
      typeof body.artistClasses === 'string'
    ) {
      payload =
        await this.eventsService.parseArrayTicketTierAndArtistClass(body);
    } else {
      payload = body;
      payload.ticketTiers = payload.ticketTiers.map((ticketTier) => ({
        name: ticketTier.name,
        price: ticketTier.price,
        royaltyTicketTier: ticketTier.royaltyPercentage,
        quantity: ticketTier.totalSupply,
        maxResalePrice: ticketTier.maxResalePrice,
        minResalePrice: ticketTier.minResalePrice,
        description: ticketTier.description,
      }));
      payload.artistClasses = payload.artistClasses.map((artistClass) => ({
        name: artistClass.name,
        royaltyPercent: artistClass.royaltyPercentage,
        artists: artistClass.artists,
      }));
    }

    const result = await this.eventsService.verifyEventInformation(
      user,
      payload,
      files,
    );

    return {
      status: HttpStatus.OK,
      message: 'Verify event information successfully',
      data: {
        ...result,
      },
    };
  }

  @ApiOperation({ summary: 'Search events for organizer' })
  @ApiCookieAuth('access_token')
  @ApiQuery({
    name: 'value',
    type: 'string',
    description: 'Search value',
    required: false,
  })
  @ApiQuery({
    name: 'skip',
    type: 'number',
    description: 'Skip',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search events successfully',
  })
  @UseGuards(JwtGuard, RoleGuard)
  @Role(UserRole.ORGANIZER)
  @Get('organizer')
  async searchEventsForOrganizer(
    @User() tokenPayload: TokenPayloadDto,
    @Query() payload: SearchEventOrganizerDto,
  ) {
    const result = await this.eventsService.searchEventsForOrganizer(
      tokenPayload,
      payload.value,
      payload.page,
      payload.limit,
    );

    return {
      status: HttpStatus.OK,
      message: 'Search events successfully',
      data: {
        ...result,
      },
    };
  }

  @ApiOperation({ summary: 'Check event creation status' })
  @ApiCookieAuth('access_token')
  @ApiQuery({
    name: 'transactionHash',
    type: 'string',
    description: 'Transaction hash',
    required: true,
  })
  @ApiQuery({
    name: 'eventMetadataUrl',
    type: 'string',
    description: 'Event ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check event creation status successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @UseGuards(JwtGuard, RoleGuard)
  @Role(UserRole.ORGANIZER)
  @Post('status')
  async checkEventCreationStatus(
    @User() tokenPayload: TokenPayloadDto,
    @Body() payload: CheckEventCreationStatusDto,
  ) {
    const status: string = await this.eventsService.checkEventCreationStatus(
      tokenPayload,
      payload,
    );
    return {
      status: HttpStatus.OK,
      message: 'Check event creation status successfully',
      data: {
        status,
      },
    };
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Role(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Delete event draft' })
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @Delete('draft/:eventId')
  async deleteEventDraft(
    @User() tokenPayload: TokenPayloadDto,
    @Param() { eventId }: GetEventDetailsDto,
  ) {
    await this.eventsService.deleteDraftEvent(eventId, tokenPayload.userId);
    return {
      status: HttpStatus.OK,
      message: 'Event deleted successfully',
    };
  }



  @ApiOperation({ summary: 'Get event details' })
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get event details successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @Get(':eventId')
  async getEventDetails(@Param() { eventId }: GetEventDetailsDto) {
    const result = await this.eventsService.getEventDetails(eventId);
    return {
      status: HttpStatus.OK,
      message: 'Get event details successfully',
      data: {
        event: result,
      },
    };
  }
}
