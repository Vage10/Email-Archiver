import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { DriveModule } from '../drive/drive.module';

@Module({
  imports: [AuthModule, EmailModule, DriveModule],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule {}
