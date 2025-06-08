export declare enum TimePeriod {
    WEEK = "week",
    MONTH = "month",
    CUSTOM = "custom"
}
export declare class GetStatisticsDto {
    type: TimePeriod;
    dateFrom?: string;
    dateTo?: string;
}
