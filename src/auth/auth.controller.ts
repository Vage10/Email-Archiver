import {
  Controller,
  Get,
  Query,
  Res,
  Redirect,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Redirect()
  getGoogleAuthUrl() {
    try {
      const url = this.authService.getAuthUrl();
      this.logger.log('🔗 Redirecting to Google OAuth2 URL');
      return { url };
    } catch (error) {
      this.logger.error('❌ Failed to get Google OAuth2 URL', error);
      throw new HttpException(
        'Failed to generate authentication link',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('google/callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      this.logger.error('❌ No auth code provided');
      throw new HttpException(
        'Authorization code is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.authService.handleGoogleCallback(code);
      this.logger.log('✅ Authentication successful');

      return res.send('✅ Authentication successful! You can close this tab.');
    } catch (error) {
      this.logger.error('❌ Authentication failed', error);
      throw new HttpException(
        'Authentication failed! Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
