import { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class DateOrderConstraint implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean;
    defaultMessage?(validationArguments?: ValidationArguments): string;
}
