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
exports.RevenueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const typeorm_2 = require("typeorm");
const statictis_dto_1 = require("../dto/statictis.dto");
const event_entity_1 = require("../entities/event.entity");
const sc_service_1 = require("../services/sc.service");
let RevenueService = class RevenueService {
    ticketSaleTransaction;
    eventRepository;
    scService;
    constructor(ticketSaleTransaction, eventRepository, scService) {
        this.ticketSaleTransaction = ticketSaleTransaction;
        this.eventRepository = eventRepository;
        this.scService = scService;
    }
    async getRevenueBreakdown(userId, type, startDate, endDate) {
        if (type === statictis_dto_1.TimePeriod.MONTH) {
            const result = await this.ticketSaleTransaction
                .createQueryBuilder('t')
                .leftJoin('t.ticketTier', 'tt')
                .leftJoin('tt.event', 'e')
                .select(`EXTRACT(WEEK FROM t.createdAt)`, 'week')
                .addSelect(`SUM(t.pricePerTicket * t.initialQuantity)`, 'revenue')
                .where('e.user.id = :organizerId', { organizerId: userId })
                .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
                .groupBy('week')
                .orderBy('week', 'ASC')
                .getRawMany();
            return result.map((r, index) => ({
                label: `Week ${index + 1}`,
                revenue: parseFloat(r.revenue),
            }));
        }
        else {
            const result = await this.ticketSaleTransaction
                .createQueryBuilder('t')
                .leftJoin('t.ticketTier', 'tt')
                .leftJoin('tt.event', 'e')
                .select(`DATE(t.createdAt)`, 'date')
                .addSelect(`SUM(t.pricePerTicket * t.initialQuantity)`, 'revenue')
                .where('e.user.id = :organizerId', { organizerId: userId })
                .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
                .groupBy('date')
                .orderBy('date', 'ASC')
                .getRawMany();
            return result.map((r) => ({
                label: new Date(r.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                }),
                revenue: parseFloat(r.revenue),
            }));
        }
    }
    async getStatisticsData(user, { type, dateFrom, dateTo }) {
        const now = new Date();
        let startDate;
        let endDate;
        switch (type) {
            case statictis_dto_1.TimePeriod.WEEK:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 6);
                endDate = new Date(now);
                break;
            case statictis_dto_1.TimePeriod.MONTH:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case statictis_dto_1.TimePeriod.CUSTOM:
                startDate = dateFrom
                    ? new Date(dateFrom)
                    : new Date(now.setMonth(now.getMonth() - 1));
                endDate = dateTo ? new Date(dateTo) : new Date();
                break;
            default:
                throw new Error('Invalid time period');
        }
        endDate.setHours(23, 59, 59, 999);
        function getPreviousPeriod(type, startDate, endDate) {
            const prevStart = new Date(startDate);
            const prevEnd = new Date(endDate);
            switch (type) {
                case statictis_dto_1.TimePeriod.WEEK:
                    prevStart.setDate(startDate.getDate() - 7);
                    prevEnd.setDate(endDate.getDate() - 7);
                    break;
                case statictis_dto_1.TimePeriod.MONTH:
                    prevStart.setMonth(startDate.getMonth() - 1);
                    prevEnd.setMonth(endDate.getMonth() - 1);
                    break;
                case statictis_dto_1.TimePeriod.CUSTOM:
                    const diffInMs = endDate.getTime() - startDate.getTime();
                    prevStart.setTime(startDate.getTime() - diffInMs);
                    prevEnd.setTime(endDate.getTime() - diffInMs);
                    break;
            }
            prevStart.setHours(0, 0, 0, 0);
            prevEnd.setHours(23, 59, 59, 999);
            return { startDate: prevStart, endDate: prevEnd };
        }
        const previousPeriod = getPreviousPeriod(type, startDate, endDate);
        const previousRevenueRaw = await this.ticketSaleTransaction
            .createQueryBuilder('t')
            .leftJoin('t.ticketTier', 'tt')
            .leftJoin('tt.event', 'e')
            .where('e.user.id = :organizerId', { organizerId: user.userId })
            .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate,
        })
            .select('COALESCE(SUM(t.pricePerTicket * t.initialQuantity), 0)', 'previousRevenue')
            .getRawOne();
        const previousTotalEvents = await this.eventRepository.count({
            where: {
                user: { id: user.userId },
                eventEndDate: (0, typeorm_2.LessThan)(new Date()),
                eventStartDate: (0, typeorm_2.Between)(previousPeriod.startDate, previousPeriod.endDate),
            },
        });
        const previousTotalOrders = await this.ticketSaleTransaction
            .createQueryBuilder('t')
            .leftJoin('t.ticketTier', 'tt')
            .leftJoin('tt.event', 'e')
            .where('e.user.id = :organizerId', { organizerId: user.userId })
            .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate,
        })
            .getCount();
        const previousRevenue = parseFloat(previousRevenueRaw.previousRevenue);
        const [numberOfEventsDraft, numberOfEventsPublished, numberOfEventsEnded, totalOrders, totalRevenueRaw, revenueBreakdown,] = await Promise.all([
            this.eventRepository.count({
                where: {
                    user: { id: user.userId },
                    status: event_entity_1.EventStatus.DRAFT,
                    eventStartDate: (0, typeorm_2.Between)(startDate, endDate),
                },
            }),
            this.eventRepository.count({
                where: {
                    user: { id: user.userId },
                    status: event_entity_1.EventStatus.PUBLISHED,
                    eventStartDate: (0, typeorm_2.Between)(startDate, endDate),
                },
            }),
            this.eventRepository.count({
                where: {
                    user: { id: user.userId },
                    eventEndDate: (0, typeorm_2.LessThan)(new Date()),
                },
            }),
            this.ticketSaleTransaction
                .createQueryBuilder('t')
                .leftJoin('t.ticketTier', 'tt')
                .leftJoin('tt.event', 'e')
                .where('e.user.id = :organizerId', { organizerId: user.userId })
                .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
                .getCount(),
            this.ticketSaleTransaction
                .createQueryBuilder('t')
                .leftJoin('t.ticketTier', 'tt')
                .leftJoin('tt.event', 'e')
                .where('e.user.id = :organizerId', { organizerId: user.userId })
                .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
                .select('COALESCE(SUM(t.pricePerTicket * t.initialQuantity), 0)', 'totalRevenue')
                .getRawOne(),
            this.getRevenueBreakdown(user.userId, type, startDate, endDate),
        ]);
        const revenueChange = previousRevenue
            ? ((totalRevenueRaw.totalRevenue - previousRevenue) / previousRevenue) *
                100
            : 0;
        const revenueChangeFormatted = +revenueChange.toFixed(2);
        const eventChange = previousTotalEvents
            ? ((numberOfEventsDraft +
                numberOfEventsPublished +
                numberOfEventsEnded -
                previousTotalEvents) /
                previousTotalEvents) *
                100
            : 0;
        const eventChangeFormatted = +eventChange.toFixed(2);
        const orderChange = previousTotalOrders
            ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100
            : 0;
        const orderChangeFormatted = +orderChange.toFixed(2);
        return {
            numberOfEventsDraft,
            numberOfEventsPublished,
            numberOfEventsEnded,
            stat: [
                {
                    title: 'Total Revenue',
                    value: parseFloat(totalRevenueRaw.totalRevenue),
                    change: revenueChangeFormatted,
                },
                {
                    title: 'Total Orders',
                    value: totalOrders,
                    change: orderChangeFormatted,
                },
                {
                    title: 'Total Events',
                    value: numberOfEventsDraft + numberOfEventsPublished + numberOfEventsEnded,
                    change: eventChangeFormatted,
                },
            ],
            revenueBreakdown,
        };
    }
    async getTicketsSoldStats(user, eventId) {
        const eventQuery = this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.ticketTiers', 'ticketTier')
            .where('event.user.id = :userId', { userId: user.userId })
            .andWhere('event.status = :status', { status: event_entity_1.EventStatus.PUBLISHED });
        if (eventId && typeof eventId === 'string' && eventId !== '{}') {
            eventQuery.andWhere('event.id = :eventId', { eventId });
        }
        const events = await eventQuery.getMany();
        const result = [];
        for (const event of events) {
            let totalSupply = 0;
            let soldQuantity = 0;
            for (const ticketTier of event.ticketTiers) {
                totalSupply += ticketTier.totalSupply;
                const remaining = await this.scService.getRemainingTickets(event.onChainId, ticketTier.tierIndex);
                const tierSold = ticketTier.totalSupply - remaining;
                soldQuantity += tierSold;
            }
            result.push({
                eventId: event.id,
                eventName: event.name,
                totalSupply,
                soldQuantity,
            });
        }
        return result;
    }
};
exports.RevenueService = RevenueService;
exports.RevenueService = RevenueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.TicketSaleTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        sc_service_1.SCService])
], RevenueService);
//# sourceMappingURL=revenue-chart.service.js.map