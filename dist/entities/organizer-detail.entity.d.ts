import { BaseEntity } from './baseEntity';
import { User } from './user.entity';
export declare class OrganizerDetail extends BaseEntity {
    email: string;
    phoneNumber: string;
    bio: string;
    facebookLink: string;
    telegramLink: string;
    instagramLink: string;
    xLink: string;
    discordLink: string;
    websiteLink: string;
    user: User;
}
