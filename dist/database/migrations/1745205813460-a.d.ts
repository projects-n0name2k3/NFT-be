import { MigrationInterface, QueryRunner } from "typeorm";
export declare class A1745205813460 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
