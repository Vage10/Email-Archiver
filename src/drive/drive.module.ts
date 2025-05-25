import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveService } from './drive.service';
import { AuthModule } from '../auth/auth.module';
import { Attachment } from '../email/entities/attachment.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Attachment])],
  providers: [DriveService],
  exports: [DriveService],
})
export class DriveModule {}
