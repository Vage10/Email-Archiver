import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  try {
    dotenv.config();
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log('App running on http://localhost:3000');
  } catch (error) {
    console.error('Error starting the application:', error);
  }
}

bootstrap().catch((error) => {
  console.error('Unhandled error during bootstrap:', error);
});
