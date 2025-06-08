import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetEventDetailsDto, GetEventMarketplaceDto } from '../dto';
import { EventsService, NftTicketsService } from '../services';
import { GetResaleTicketDto } from '../dto/get-resale-ticket.dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly nftTicketsService: NftTicketsService,
  ) {}

  @ApiOperation({ summary: 'Get events for marketplace' })
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get events for marketplace successfully',
  })
  @Get()
  async getEventsForMarketPlace(@Query() payload: GetEventMarketplaceDto) {
    const result = await this.eventsService.getEventsForMarketplace(payload);
    return {
      status: HttpStatus.OK,
      message: 'Get event for marketplace successfully',
      data: {
        ...result,
      },
    };
  }

  @ApiOperation({ summary: 'Get list resale ticket for specific event' })
  @ApiParam({
    name: 'eventId',
    type: String,
    required: true,
  })
  @Get('/:eventId')
  async getResaleTicket(
    @Param() { eventId }: GetEventDetailsDto,
    @Query() query: GetResaleTicketDto,
  ) {
    const result = await this.nftTicketsService.getResaleTicket(eventId, query);
    return {
      status: HttpStatus.OK,
      message: 'Resale ticket is fetched successfully',
      data: result,
    };
  }
}
