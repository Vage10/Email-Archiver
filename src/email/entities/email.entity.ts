import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { Attachment } from './attachment.entity';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  gmailId: string;

  @Column()
  threadId: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ length: 255 })
  sender: string;

  @Column({ length: 255 })
  to: string;

  @Column({ nullable: true, length: 255 })
  cc: string;

  @Column({ nullable: true, length: 255 })
  bcc: string;

  @Column()
  @Index()
  timestamp: Date;

  @Column({ type: 'text' })
  bodyPlain: string;

  @Column({ type: 'text', nullable: true })
  bodyHtml: string;

  @OneToMany(() => Attachment, (attachment) => attachment.email, {
    cascade: true,
  })
  attachments: Attachment[];
}
