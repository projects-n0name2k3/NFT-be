export declare enum SortType {
    ASC = "asc",
    DESC = "desc"
}
export declare class GetTicketsByTierDto {
    page: number;
    limit: number;
    get skip(): number;
    sortType: SortType;
    tierId: string;
}
