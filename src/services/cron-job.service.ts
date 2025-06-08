import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  BlockchainEventProcessor,
  EventBlockchain,
} from './blockchain-event-processor.service';

@Injectable()
export class CronService {
  private isRunning: Record<string, boolean> = {};
  private readonly logger = new Logger(CronService.name);
  private readonly eventTypes = Object.values(EventBlockchain);
  constructor(
    private readonly blockchainEventProcessor: BlockchainEventProcessor,
  ) {}

  @Cron('*/10 * * * * *', { name: 'BlockchainEvents' })
  async handleEvent() {
    await Promise.all(
      this.eventTypes.map((eventType) => this.handleCron(eventType)),
    );
  }

  async handleCron(eventType: string) {
    if (this.isRunning[eventType]) {
      this.logger.warn(
        'Cron job skipped because the previous job is still running.',
      );
      return;
    }
    try {
      this.isRunning[eventType] = true;
      this.logger.debug(`Cron job ${eventType} started`);

      const handler = this.blockchainEventProcessor.eventJobHandlers[eventType];
      if (handler) {
        await handler(this.blockchainEventProcessor);
      }

      this.logger.debug('Cron job finished');
    } finally {
      this.isRunning[eventType] = false;
    }
  }
}
