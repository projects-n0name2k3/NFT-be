import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiQuery } from '@nestjs/swagger';
import { number, string } from 'joi';
import { Role } from '../common/decorators/role.decorator';
import { User } from '../common/decorators/user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import {
  GetEventDetailsDto,
  GetTicketTierDetailsDto,
  SyncResaleCreationDto,
  TokenPayloadDto,
  VerifyBuyResaleTicketStatusDto,
  VerifyResaleCancellationStatusDto,
  VerifyResaleCreationStatusDto,
  GetNftTicketDetailDto,
} from '../dto';
import { TicketDto } from '../dto/create-ticket.dto';
import { GetResaleTicketDto } from '../dto/get-resale-ticket.dto';
import { GetTicketsByUserDto } from '../dto/get-ticket-inventory.dto';
import { SearchResaleTicketDto } from '../dto/search-resale-ticket.dto';
import { GetTicketsByTierDto } from '../dto/search-ticket.dto';
import { GetStatisticsDto, TimePeriod } from '../dto/statictis.dto';
import { UserRole } from '../entities/user.entity';
import {
  BlockchainSnapshotsService,
  TicketSaleTransactionsService,
  TicketTiersService,
} from '../services';
import { NftTicketsService } from '../services/nft-tickets.service';
import { RevenueService } from '../services/revenue-chart.service';
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly blockchainSnapshotsService: BlockchainSnapshotsService,
    private readonly ticketTiersService: TicketTiersService,
    private readonly nftTicketsService: NftTicketsService,
    private readonly revenueService: RevenueService,
    private readonly ticketSaleService: TicketSaleTransactionsService,
  ) {}

  @ApiOperation({ summary: 'Get ticket inventory by user' })
  @ApiQuery({ type: GetTicketsByUserDto })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT tickets fetched successfully',
  })
  @UseGuards(JwtGuard)
  @Get('inventory')
  async getNftTicketsByUser(
    @User() user: TokenPayloadDto,
    @Query() query: GetTicketsByUserDto,
  ) {
    const result = await this.nftTicketsService.getNftTicketsByUser(
      user,
      query,
    );
    return {
      status: HttpStatus.OK,
      message: 'NFT tickets fetched successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get NFT ticket details' })
  @ApiParam({ name: 'tierId', type: String, required: true })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT ticket details fetched successfully',
  })
  @UseGuards(JwtGuard)
  @Get('details/:nftTicketId')
  async getNftTicketDetails(
    @User() user: TokenPayloadDto,
    @Param() payload: GetNftTicketDetailDto,
  ) {
    const result = await this.nftTicketsService.getNftTicketDetails(
      user,
      payload,
    );
    return {
      status: HttpStatus.OK,
      message: 'NFT ticket details fetched successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Check ticket mint status after buying' })
  @ApiBody({ type: string })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT tickets fetched successfully',
  })
  @UseGuards(JwtGuard)
  @Get('check/mint/status')
  async checkTicketMintStatus(@Body() transaction_hash: string) {
    this.nftTicketsService.checkTicketMintStatus(transaction_hash);
  }

  @ApiOperation({ summary: 'Filter tickets by tier of specific event' })
  @Get('nft-tickets/:eventId')
  async getTicketsByTier(
    @Param('eventId') eventId: string,
    @Query() query: GetTicketsByTierDto,
  ) {
    const result = await this.nftTicketsService.getTicketsByTier(
      eventId,
      query,
    );
    return {
      status: HttpStatus.OK,
      message: 'Nft tickets fetched by ticket tiers successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Verify resale creation status' })
  @ApiBody({ type: VerifyResaleCreationStatusDto })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resale creation status verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transaction hash or sale id is not match',
  })
  @UseGuards(JwtGuard)
  @Post('resale/status')
  @HttpCode(HttpStatus.OK)
  async verifyResaleCreationStatus(
    @Body() payload: VerifyResaleCreationStatusDto,
    @User() user: TokenPayloadDto,
  ) {
    const status =
      await this.blockchainSnapshotsService.verifyResaleCreationStatus(
        payload,
        user,
      );
    return {
      status: HttpStatus.OK,
      message: 'Resale creation status verified successfully',
      data: {
        status,
      },
    };
  }

  @ApiOperation({ summary: 'Get revenue chart statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Revenue statistics retrieved successfully',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtGuard)
  @Get('/chart')
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for statistics period',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for statistics period',
  })
  @ApiQuery({
    name: 'periodType',
    required: false,
    enum: TimePeriod,
    description: 'Type of time period for grouping data',
  })
  async getRevenueChart(
    @User() user: TokenPayloadDto,
    @Query() getStatisticsDto: GetStatisticsDto,
  ) {
    const result = await this.revenueService.getStatisticsData(
      user,
      getStatisticsDto,
    );
    return {
      status: HttpStatus.OK,
      message: 'Get chart successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get tickets sold by event' })
  @ApiQuery({
    name: 'eventId',
    required: true,
    type: String,
    description: 'ID of the event to get sold tickets for',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved tickets sold successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtGuard)
  @Get('/sold')
  async getTicketSold(@User() user: TokenPayloadDto, @Query() eventId: string) {
    const result = await this.revenueService.getTicketsSoldStats(user, eventId);
    return {
      status: HttpStatus.OK,
      message: 'Get chart successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get resale ticket by price' })
  @Get('/resale/filter/price')
  async sortingTicketResaleByPrice(@Query() query: SearchResaleTicketDto) {
    const result = await this.nftTicketsService.getResaleTicketByPrice(query);
    return {
      status: HttpStatus.OK,
      message: 'Resale ticket is fetched by min and max price successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Verify resale cancellation status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        saleId: { type: 'number' },
        transactionHash: { type: 'string' },
      },
    },
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resale cancellation status verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket resale not found',
  })
  @UseGuards(JwtGuard)
  @Post('resale/cancel/status')
  @HttpCode(HttpStatus.OK)
  async verifyResaleCancellationStatus(
    @Body() payload: VerifyResaleCancellationStatusDto,
    @User() user: TokenPayloadDto,
  ) {
    const status =
      await this.blockchainSnapshotsService.verifyResaleCancellationStatus(
        payload,
        user,
      );
    return {
      status: HttpStatus.OK,
      message: 'Resale cancellation status verified successfully',
      data: {
        status,
      },
    };
  }

  @ApiOperation({ summary: 'Verify buy resale ticket status' })
  @ApiBody({ type: VerifyBuyResaleTicketStatusDto })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Buy resale ticket status verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket resale not found or Ticket sale transaction is closed',
  })
  @UseGuards(JwtGuard)
  @Post('resale/buy/status')
  @HttpCode(HttpStatus.OK)
  async verifyBuyResaleTicketStatus(
    @Body() payload: VerifyBuyResaleTicketStatusDto,
    @User() user: TokenPayloadDto,
  ) {
    const status =
      await this.blockchainSnapshotsService.verifyBuyResaleTicketStatus(
        payload,
        user,
      );
    return {
      status: HttpStatus.OK,
      message: 'Buy resale ticket status verified successfully',
      data: {
        status,
      },
    };
  }

  @ApiOperation({ summary: 'Get resale ticket detail' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get resale ticket detail successfully',
  })
  @Get('/resale/details/:id')
  async getResaleTicketDetails(@Param('id') id: string) {
    const result = await this.nftTicketsService.getResaleTicketDetails(id);
    return {
      status: HttpStatus.OK,
      message: 'Get ticket resale details successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get ticket tier details' })
  @ApiParam({
    name: 'tierId',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get ticket tier details successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket tier not found',
  })
  @Get(':tierId')
  async getTicketTiers(@Param() { tierId }: GetTicketTierDetailsDto) {
    const ticketTier =
      await this.ticketTiersService.getTicketTierDetails(tierId);

    return {
      status: HttpStatus.OK,
      message: 'Get ticket tier details successfully',
      data: {
        ticketTier,
      },
    };
  }

  @ApiOperation({ summary: 'Get selling ticket by user' })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resale cancellation status verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket resale not found',
  })
  @UseGuards(JwtGuard)
  @Get('resale/selling')
  @HttpCode(HttpStatus.OK)
  async getSellingTicketByUser(
    @User() user: TokenPayloadDto,
    @Query() query: GetTicketsByUserDto,
  ) {
    const result = await this.ticketSaleService.getSellingTicketByUserId(
      user,
      query,
    );
    return {
      status: HttpStatus.OK,
      message: 'Get selling ticket by user successfully',
      data: result,
    };
  }
}
