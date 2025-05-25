import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GmailService } from '../gmail/gmail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly gmailService: GmailService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('⏰ Running scheduled email fetch...');
    try {
      await this.gmailService.fetchNewEmails();
    } catch (error) {
      const errMsg = error instanceof Error ? error.stack : String(error);
      this.logger.error('❌ Failed to fetch emails:\n' + errMsg);
    }
  }
}
