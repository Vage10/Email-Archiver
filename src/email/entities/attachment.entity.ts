import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Email } from './email.entity';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  filename: string;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  @Index()
  driveFileId: string;

  @Column({ nullable: true })
  downloadLink: string;

  @Column()
  attachmentId: string;

  @ManyToOne(() => Email, (email) => email.attachments)
  email: Email;
}
