import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Email } from '../email/entities/email.entity';
import { Attachment } from '../email/entities/attachment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('DATABASE CONFIG:');
        console.log('Host:', config.get<string>('DATABASE_HOST'));
        console.log('Port:', config.get<string>('DATABASE_PORT'));
        console.log('User:', config.get<string>('DATABASE_USER'));
        console.log('DB Name:', config.get<string>('DATABASE_NAME'));

        return {
          type: 'postgres',
          host: config.get<string>('DATABASE_HOST') || 'localhost',
          port: parseInt(config.get<string>('DATABASE_PORT') || '5432', 10),
          username: config.get<string>('DATABASE_USER') || 'postgres',
          password: config.get<string>('DATABASE_PASSWORD') || '',
          database: config.get<string>('DATABASE_NAME') || 'email_archiver',
          entities: [Email, Attachment],
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
