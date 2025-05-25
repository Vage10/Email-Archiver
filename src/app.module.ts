import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GmailModule } from './gmail/gmail.module';
import { EmailModule } from './email/email.module';
import { DriveModule } from './drive/drive.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    GmailModule,
    EmailModule,
    DriveModule,
    SchedulerModule,
  ],
})
export class AppModule {}
