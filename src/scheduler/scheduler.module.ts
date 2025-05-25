import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { GmailModule } from '../gmail/gmail.module';

@Module({
  imports: [ScheduleModule.forRoot(), GmailModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
