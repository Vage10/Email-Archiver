import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { Email } from './entities/email.entity';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Email, Attachment])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
