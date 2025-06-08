import { BaseEntity } from './baseEntity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('organizer_details')
export class OrganizerDetail extends BaseEntity {
  @Index()
  @Column({ unique: true, nullable: false })
  email: string;

  @Index()
  @Column({ name: 'phone_number', length: 10, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ name: 'facebook_link', nullable: true })
  facebookLink: string;

  @Column({ name: 'telegram_link', nullable: true })
  telegramLink: string;

  @Column({ name: 'instagram_link', nullable: true })
  instagramLink: string;

  @Column({ name: 'x_link', nullable: true })
  xLink: string;

  @Column({ name: 'discord_link', nullable: true })
  discordLink: string;

  @Column({ name: 'website_link', nullable: true })
  websiteLink: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'organizer_id' })
  user: User;
}
