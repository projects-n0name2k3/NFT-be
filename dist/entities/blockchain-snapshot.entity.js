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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainSnapshot = exports.BlockchainSnapshotStatus = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
var BlockchainSnapshotStatus;
(function (BlockchainSnapshotStatus) {
    BlockchainSnapshotStatus["SUCCESS"] = "success";
    BlockchainSnapshotStatus["FAILED"] = "failed";
})(BlockchainSnapshotStatus || (exports.BlockchainSnapshotStatus = BlockchainSnapshotStatus = {}));
let BlockchainSnapshot = class BlockchainSnapshot extends baseEntity_1.BaseEntity {
    blockNumber;
    transactionHash;
    eventName;
    eventData;
    status;
};
exports.BlockchainSnapshot = BlockchainSnapshot;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'block_number', type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], BlockchainSnapshot.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'transaction_hash', unique: true, nullable: false }),
    __metadata("design:type", String)
], BlockchainSnapshot.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_name', nullable: false }),
    __metadata("design:type", String)
], BlockchainSnapshot.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_data', nullable: false, type: 'json' }),
    __metadata("design:type", Object)
], BlockchainSnapshot.prototype, "eventData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: BlockchainSnapshotStatus,
        nullable: false,
    }),
    __metadata("design:type", String)
], BlockchainSnapshot.prototype, "status", void 0);
exports.BlockchainSnapshot = BlockchainSnapshot = __decorate([
    (0, typeorm_1.Entity)('blockchain_snapshots')
], BlockchainSnapshot);
//# sourceMappingURL=blockchain-snapshot.entity.js.map