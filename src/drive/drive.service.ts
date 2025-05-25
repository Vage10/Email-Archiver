import { Injectable, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { AuthService } from '../auth/auth.service';
import { Attachment } from '../email/entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private drive: drive_v3.Drive;

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
  ) {
    const authClient: OAuth2Client = this.authService.getClient();
    this.drive = google.drive({ version: 'v3', auth: authClient });
  }

  async uploadAttachment(
    filename: string,
    mimeType: string,
    data: Buffer,
  ): Promise<void> {
    this.logger.log(`🔄 Uploading attachment: ${filename}`);

    try {
      const fileMetadata = {
        name: filename,
      };

      const media = {
        mimeType,
        body: BufferToStream(data),
      };

      const result = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink, webContentLink',
      });

      const driveFile = result.data;

      if (!driveFile.id || !driveFile.webViewLink) {
        throw new Error(
          'Failed to obtain file ID or web link from Google Drive',
        );
      }

      await this.attachmentRepo.update(
        { filename },
        {
          driveFileId: driveFile.id,
          downloadLink: driveFile.webViewLink,
        },
      );

      this.logger.log(`✅ Uploaded to Drive: ${driveFile.id}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error uploading to Drive: ${errMsg}`);
      throw error;
    }
  }
}

function BufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
