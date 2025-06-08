import { HttpStatus } from '@nestjs/common';
import { GetTicketTierDetailsDto, TokenPayloadDto, VerifyBuyResaleTicketStatusDto, VerifyResaleCancellationStatusDto, VerifyResaleCreationStatusDto, GetNftTicketDetailDto } from '../dto';
import { GetTicketsByUserDto } from '../dto/get-ticket-inventory.dto';
import { SearchResaleTicketDto } from '../dto/search-resale-ticket.dto';
import { GetTicketsByTierDto } from '../dto/search-ticket.dto';
import { GetStatisticsDto } from '../dto/statictis.dto';
import { BlockchainSnapshotsService, TicketSaleTransactionsService, TicketTiersService } from '../services';
import { NftTicketsService } from '../services/nft-tickets.service';
import { RevenueService } from '../services/revenue-chart.service';
export declare class TicketsController {
    private readonly blockchainSnapshotsService;
    private readonly ticketTiersService;
    private readonly nftTicketsService;
    private readonly revenueService;
    private readonly ticketSaleService;
    constructor(blockchainSnapshotsService: BlockchainSnapshotsService, ticketTiersService: TicketTiersService, nftTicketsService: NftTicketsService, revenueService: RevenueService, ticketSaleService: TicketSaleTransactionsService);
    getNftTicketsByUser(user: TokenPayloadDto, query: GetTicketsByUserDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            tickets: any[];
            totalPages: number;
        };
    }>;
    getNftTicketDetails(user: TokenPayloadDto, payload: GetNftTicketDetailDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            event: {
                id: string;
                name: string;
                description: string;
                eventStartDate: Date;
                eventEndDate: Date;
                sellStartDate: Date;
                sellEndDate: Date;
                thumbnailUrl: string;
                coverPhotoUrl: string;
                venue: string;
                seatmapUrl: string;
                maxPerUser: number;
                onchainId: number;
                ticketAddress: string;
                transactionHash: string;
                location: {
                    latitude: number;
                    longitude: number;
                    locationName: string;
                };
            };
            organizer: import("../entities/user.entity").User;
            ticketTier: {
                id: string;
                name: string;
                price: number;
                totalSupply: number;
                availableSupply: number;
                minResalePrice: number;
                maxResalePrice: number;
                royaltyPercentage: number;
                tierIndex: number;
                description: string;
            };
            nftTicket: {
                id: string;
                owner: import("../entities/user.entity").User;
                quantity: number;
            };
        };
    }>;
    checkTicketMintStatus(transaction_hash: string): Promise<void>;
    getTicketsByTier(eventId: string, query: GetTicketsByTierDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            tickets: any[];
            totalPages: number;
        };
    }>;
    verifyResaleCreationStatus(payload: VerifyResaleCreationStatusDto, user: TokenPayloadDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            status: string;
        };
    }>;
    getRevenueChart(user: TokenPayloadDto, getStatisticsDto: GetStatisticsDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            numberOfEventsDraft: number;
            numberOfEventsPublished: number;
            numberOfEventsEnded: number;
            stat: {
                title: string;
                value: number;
                change: number;
            }[];
            revenueBreakdown: {
                label: string;
                revenue: number;
            }[];
        };
    }>;
    getTicketSold(user: TokenPayloadDto, eventId: string): Promise<{
        status: HttpStatus;
        message: string;
        data: any[];
    }>;
    sortingTicketResaleByPrice(query: SearchResaleTicketDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            result: any[];
            totalPages: number;
        };
    }>;
    verifyResaleCancellationStatus(payload: VerifyResaleCancellationStatusDto, user: TokenPayloadDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            status: string;
        };
    }>;
    verifyBuyResaleTicketStatus(payload: VerifyBuyResaleTicketStatusDto, user: TokenPayloadDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            status: string;
        };
    }>;
    getResaleTicketDetails(id: string): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            [x: number]: any;
            length: number;
            toString(): string;
            toLocaleString(): string;
            toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
            pop(): any;
            push(...items: any[]): number;
            concat(...items: ConcatArray<any>[]): any[];
            concat(...items: any[]): any[];
            join(separator?: string): string;
            reverse(): any[];
            shift(): any;
            slice(start?: number, end?: number): any[];
            sort(compareFn?: ((a: any, b: any) => number) | undefined): any[];
            splice(start: number, deleteCount?: number): any[];
            splice(start: number, deleteCount: number, ...items: any[]): any[];
            unshift(...items: any[]): number;
            indexOf(searchElement: any, fromIndex?: number): number;
            lastIndexOf(searchElement: any, fromIndex?: number): number;
            every<S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): this is S[];
            every(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean;
            some(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean;
            forEach(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): void;
            map<U>(callbackfn: (value: any, index: number, array: any[]) => U, thisArg?: any): U[];
            filter<S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): S[];
            filter(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): any[];
            reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any;
            reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any;
            reduce<U>(callbackfn: (previousValue: U, currentValue: any, currentIndex: number, array: any[]) => U, initialValue: U): U;
            reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any;
            reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any;
            reduceRight<U>(callbackfn: (previousValue: U, currentValue: any, currentIndex: number, array: any[]) => U, initialValue: U): U;
            find<S extends any>(predicate: (value: any, index: number, obj: any[]) => value is S, thisArg?: any): S | undefined;
            find(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): any;
            findIndex(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): number;
            fill(value: any, start?: number, end?: number): any[];
            copyWithin(target: number, start: number, end?: number): any[];
            entries(): ArrayIterator<[number, any]>;
            keys(): ArrayIterator<number>;
            values(): ArrayIterator<any>;
            includes(searchElement: any, fromIndex?: number): boolean;
            flatMap<U, This = undefined>(callback: (this: This, value: any, index: number, array: any[]) => U | readonly U[], thisArg?: This | undefined): U[];
            flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[];
            at(index: number): any;
            findLast<S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): S | undefined;
            findLast(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): any;
            findLastIndex(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): number;
            toReversed(): any[];
            toSorted(compareFn?: ((a: any, b: any) => number) | undefined): any[];
            toSpliced(start: number, deleteCount: number, ...items: any[]): any[];
            toSpliced(start: number, deleteCount?: number): any[];
            with(index: number, value: any): any[];
            [Symbol.iterator](): ArrayIterator<any>;
            [Symbol.unscopables]: {
                [x: number]: boolean | undefined;
                length?: boolean | undefined;
                toString?: boolean | undefined;
                toLocaleString?: boolean | undefined;
                pop?: boolean | undefined;
                push?: boolean | undefined;
                concat?: boolean | undefined;
                join?: boolean | undefined;
                reverse?: boolean | undefined;
                shift?: boolean | undefined;
                slice?: boolean | undefined;
                sort?: boolean | undefined;
                splice?: boolean | undefined;
                unshift?: boolean | undefined;
                indexOf?: boolean | undefined;
                lastIndexOf?: boolean | undefined;
                every?: boolean | undefined;
                some?: boolean | undefined;
                forEach?: boolean | undefined;
                map?: boolean | undefined;
                filter?: boolean | undefined;
                reduce?: boolean | undefined;
                reduceRight?: boolean | undefined;
                find?: boolean | undefined;
                findIndex?: boolean | undefined;
                fill?: boolean | undefined;
                copyWithin?: boolean | undefined;
                entries?: boolean | undefined;
                keys?: boolean | undefined;
                values?: boolean | undefined;
                includes?: boolean | undefined;
                flatMap?: boolean | undefined;
                flat?: boolean | undefined;
                at?: boolean | undefined;
                findLast?: boolean | undefined;
                findLastIndex?: boolean | undefined;
                toReversed?: boolean | undefined;
                toSorted?: boolean | undefined;
                toSpliced?: boolean | undefined;
                with?: boolean | undefined;
                [Symbol.iterator]?: boolean | undefined;
                readonly [Symbol.unscopables]?: boolean | undefined;
            };
        };
    }>;
    getTicketTiers({ tierId }: GetTicketTierDetailsDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            ticketTier: {
                availableSupply: number;
                name: string;
                price: number;
                totalSupply: number;
                maxResalePrice: number;
                minResalePrice: number;
                royaltyPercentage: number;
                tierIndex: number;
                description: string;
                event: import("../entities").Event;
                nftTickets: import("../entities").NftTicket[];
                ticketSaleTransactions: import("../entities").TicketSaleTransaction[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getSellingTicketByUser(user: TokenPayloadDto, query: GetTicketsByUserDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            tickets: any[];
            totalPages: number;
        };
    }>;
}
