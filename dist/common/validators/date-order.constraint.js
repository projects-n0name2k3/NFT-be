"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateOrderConstraint = void 0;
class DateOrderConstraint {
    validate(value, validationArguments) {
        const dto = validationArguments?.object;
        const sellStartDate = new Date(dto.sellStartDate);
        const sellEndDate = new Date(dto.sellEndDate);
        const eventStartDate = new Date(dto.eventStartDate);
        const eventEndDate = new Date(dto.eventEndDate);
        if (sellStartDate >= eventStartDate) {
            return false;
        }
        if (sellEndDate <= sellStartDate) {
            return false;
        }
        if (eventStartDate >= eventEndDate) {
            return false;
        }
        return true;
    }
    defaultMessage(validationArguments) {
        const dto = validationArguments?.object;
        const sellStartDate = new Date(dto.sellStartDate);
        const sellEndDate = new Date(dto.sellEndDate);
        const eventStartDate = new Date(dto.eventStartDate);
        const eventEndDate = new Date(dto.eventEndDate);
        if (sellStartDate >= eventStartDate) {
            return 'sellStartDate must be before eventStartDate';
        }
        if (sellEndDate <= sellStartDate) {
            return 'sellEndDate must be after sellStartDate';
        }
        if (eventStartDate >= eventEndDate) {
            return 'eventStartDate must be before eventEndDate';
        }
        return 'Date validation failed';
    }
}
exports.DateOrderConstraint = DateOrderConstraint;
//# sourceMappingURL=date-order.constraint.js.map