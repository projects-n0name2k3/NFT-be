import { BaseEntity } from './baseEntity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

enum Actor {
  USER = 'user',
  ORGANIZER = 'organizer',
  EVENT = 'event',
}

interface ActionInterface {
  type: Actor;
  action: string;
}

@Entity('action_logs')
export class ActionLog extends BaseEntity {
  @Column({ type: 'json', nullable: false })
  action: ActionInterface;

  @Index()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @ManyToOne(() => Event, (event) => event.id)
  @JoinColumn({ name: 'eventId' })
  event: Event;
}
