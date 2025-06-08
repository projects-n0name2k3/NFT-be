import { BaseEntity } from './baseEntity';
import { User } from './user.entity';
import { Event } from './event.entity';
declare enum Actor {
    USER = "user",
    ORGANIZER = "organizer",
    EVENT = "event"
}
interface ActionInterface {
    type: Actor;
    action: string;
}
export declare class ActionLog extends BaseEntity {
    action: ActionInterface;
    user: User;
    event: Event;
}
export {};
