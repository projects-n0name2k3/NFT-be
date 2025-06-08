import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateEventDraftDto } from '../../dto';

export class DateOrderConstraint implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const dto = validationArguments?.object as CreateEventDraftDto;
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
  defaultMessage?(validationArguments?: ValidationArguments): string {
    const dto = validationArguments?.object as CreateEventDraftDto;
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
