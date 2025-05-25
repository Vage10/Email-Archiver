import { Injectable, Logger } from '@nestjs/common';
import { google, gmail_v1 } from 'googleapis';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { DriveService } from '../drive/drive.service';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private gmail: gmail_v1.Gmail;

  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly driveService: DriveService,
  ) {
    const authClient = this.authService.getClient();
    this.gmail = google.gmail({ version: 'v1', auth: authClient });
  }

  async fetchNewEmails(): Promise<void> {
    this.logger.log('Checking for new emails...');

    const res = await this.gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    if (messages.length === 0) {
      this.logger.log('No new messages.');
      return;
    }

    for (const msg of messages) {
      if (!msg.id) continue;

      const fullMessageRes = await this.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const fullMessage = fullMessageRes.data;
      const processed = await this.emailService.processEmail(fullMessage);

      if (processed.attachments.length > 0) {
        for (const att of processed.attachments) {
          if (!att.attachmentId || !att.filename || !att.mimeType) continue;

          const data = await this.downloadAttachment(msg.id, att.attachmentId);
          await this.driveService.uploadAttachment(
            att.filename,
            att.mimeType,
            data,
          );
        }
      }
    }

    this.logger.log(`Processed ${messages.length} messages.`);
  }

  private async downloadAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const result = await this.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    const data = result.data?.data ?? '';
    return Buffer.from(data, 'base64');
  }
}
