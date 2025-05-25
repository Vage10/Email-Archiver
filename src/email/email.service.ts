import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from './entities/email.entity';
import { Attachment } from './entities/attachment.entity';
import { gmail_v1 } from 'googleapis';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(Email)
    private emailRepo: Repository<Email>,
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
  ) {}

  async processEmail(
    message: gmail_v1.Schema$Message,
  ): Promise<{ email: Email; attachments: Attachment[] }> {
    const gmailId = message.id;
    if (!gmailId) {
      this.logger.error('Message ID is missing.');
      throw new Error('Message ID is missing.');
    }

    this.logger.log(`Processing email with ID: ${gmailId}`);

    const existing = await this.emailRepo.findOne({ where: { gmailId } });
    if (existing) {
      this.logger.log(`Email already exists with ID: ${gmailId}`);
      return { email: existing, attachments: [] };
    }

    const headers = this.getHeaders(message.payload?.headers || []);
    const email = new Email();
    email.gmailId = gmailId;
    email.threadId = message.threadId || '';
    email.subject = headers.subject || '(No Subject)';
    email.sender = headers.from || '';
    email.to = headers.to || '';
    email.cc = headers.cc || '';
    email.bcc = headers.bcc || '';
    email.timestamp = message.internalDate
      ? new Date(parseInt(message.internalDate, 10))
      : new Date();

    email.bodyPlain = this.extractBody(message.payload, 'text/plain') || '';
    email.bodyHtml = this.extractBody(message.payload, 'text/html') || '';

    const attachments = this.extractAttachments(message.payload);
    email.attachments = attachments;

    await this.emailRepo.save(email);
    this.logger.log(`Email saved with ID: ${email.id}`);

    return { email, attachments };
  }

  private getHeaders(
    headers: gmail_v1.Schema$MessagePartHeader[] = [],
  ): Record<string, string> {
    const map: Record<string, string> = {};
    for (const h of headers) {
      if (h.name && h.value) {
        map[h.name.toLowerCase()] = h.value;
      }
    }
    return map;
  }

  private extractBody(
    payload?: gmail_v1.Schema$MessagePart,
    mimeType?: string,
  ): string | null {
    if (!payload) return null;

    if (payload.mimeType === mimeType && payload.body?.data) {
      try {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } catch (err) {
        this.logger.error('Failed to decode body:', err);
        return null;
      }
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        const body = this.extractBody(part, mimeType);
        if (body) return body;
      }
    }

    return null;
  }

  private extractAttachments(
    payload?: gmail_v1.Schema$MessagePart,
  ): Attachment[] {
    const attachments: Attachment[] = [];

    const findAttachments = (part: gmail_v1.Schema$MessagePart) => {
      if (part.filename && part.body?.attachmentId) {
        const attachment = new Attachment();
        attachment.filename = part.filename;
        attachment.mimeType = part.mimeType || 'application/octet-stream';
        attachment.attachmentId = part.body.attachmentId;
        attachments.push(attachment);
      }

      if (part.parts) {
        for (const subPart of part.parts) {
          findAttachments(subPart);
        }
      }
    };

    if (payload) {
      findAttachments(payload);
    }

    return attachments;
  }
}
