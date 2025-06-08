export declare enum SortType {
    ASC = "asc",
    DESC = "desc"
}
export declare class GetTicketsByUserDto {
    limit: number;
    page: number;
    sortType: SortType;
    value: string;
}
