"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSaleTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const get_ticket_inventory_dto_1 = require("../dto/get-ticket-inventory.dto");
const entities_1 = require("../entities");
const typeorm_2 = require("typeorm");
let TicketSaleTransactionsService = class TicketSaleTransactionsService {
    ticketSaleTransactionRepository;
    constructor(ticketSaleTransactionRepository) {
        this.ticketSaleTransactionRepository = ticketSaleTransactionRepository;
    }
    async getSellingTicketByUserId(user, { limit = 8, page = 1, sortType = get_ticket_inventory_dto_1.SortType.DESC, value, }) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.ticketSaleTransactionRepository
            .createQueryBuilder('ticket_sale_transaction')
            .select([
            'ticket_sale_transaction.id as id',
            'ticket_sale_transaction.sale_id as sale_id',
            'ticket_sale_transaction.status as status',
            'ticket_sale_transaction.createdAt as "createdAt"',
            'ticketTier.name as "tierName"',
            'ticketTier.price as "price"',
            'ticket_sale_transaction.remainingQuantity as quantity',
            'event.id as "eventId"',
            'event.name as "eventName"',
            'event.location as "location"',
            'event.event_start_date as "eventStartDate"',
            'event.event_end_date as "eventEndDate"',
            'event.venue as "venue"',
            'event.thumbnail_url as "eventThumbnailUrl"',
            'event.createdAt as "eventCreatedAt"',
        ])
            .leftJoin('ticket_sale_transaction.ticketTier', 'ticketTier')
            .leftJoin('ticketTier.event', 'event')
            .where('ticket_sale_transaction.seller_wallet_address = :walletId', {
            walletId: user.walletAddress,
        })
            .andWhere('ticket_sale_transaction.remainingQuantity > 0')
            .andWhere('ticket_sale_transaction.status != :status', {
            status: 'closed',
        });
        if (value) {
            queryBuilder.andWhere('LOWER(event.name) LIKE LOWER(:eventName)', {
                eventName: `%${value}%`,
            });
        }
        queryBuilder
            .orderBy('ticket_sale_transaction.createdAt', sortType === get_ticket_inventory_dto_1.SortType.ASC ? 'ASC' : 'DESC')
            .offset(skip)
            .limit(limit);
        const [ticketData, total] = await Promise.all([
            queryBuilder.getRawMany(),
            queryBuilder.getCount(),
        ]);
        const tickets = ticketData.map(({ location, price, ...rest }) => ({
            ...rest,
            locationName: location?.split(' ').slice(0, -2).join(' ') || null,
            price: Number(price),
        }));
        const totalPages = Math.ceil(total / limit);
        return {
            tickets,
            totalPages,
        };
    }
};
exports.TicketSaleTransactionsService = TicketSaleTransactionsService;
exports.TicketSaleTransactionsService = TicketSaleTransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.TicketSaleTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TicketSaleTransactionsService);
//# sourceMappingURL=ticket-sale-transactions.service.js.map