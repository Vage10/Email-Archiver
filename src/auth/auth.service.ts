import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private oauth2Client: OAuth2Client;
  private readonly TOKEN_PATH = path.join(__dirname, '../../tokens.json');

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.error(
        '❌ Missing Google API credentials in environment variables',
      );
      throw new Error('Missing Google API credentials');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    this.loadTokens();

    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        this.logger.log(`🔄 Refresh token obtained`);
        this.saveTokensToFile(tokens);
      }
      if (tokens.access_token) {
        this.logger.log(`🔄 Access token updated`);
        this.saveTokensToFile(tokens);
      }
    });
  }

  private loadTokens(): void {
    try {
      if (fs.existsSync(this.TOKEN_PATH)) {
        this.logger.log('✅ Token file found, attempting to load it');
        const content = fs.readFileSync(this.TOKEN_PATH, 'utf8');

        if (!content) {
          throw new Error('Token file is empty');
        }

        const tokens = JSON.parse(content) as Credentials | string;

        if (typeof tokens === 'string') {
          this.oauth2Client.setCredentials({ access_token: tokens });
          this.logger.log('⚠️ Token was a string, set as { access_token }');
        } else {
          this.oauth2Client.setCredentials(tokens);
          this.logger.log('✅ Token loaded successfully from tokens.json');
        }
      } else {
        this.logger.warn(
          '⚠️ No token found, user must authenticate via Google.',
        );
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ Failed to load tokens.json: ${errMsg}`);
    }
  }

  private saveTokensToFile(tokens: Credentials): void {
    let refreshToken = tokens.refresh_token;
    if (!refreshToken && fs.existsSync(this.TOKEN_PATH)) {
      try {
        const previousTokens = JSON.parse(
          fs.readFileSync(this.TOKEN_PATH, 'utf8'),
        ) as Credentials;
        refreshToken = previousTokens.refresh_token;
      } catch (err) {
        this.logger.error(`${err}`);
      }
    }

    const credentials = {
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    };

    fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(credentials, null, 2));
    this.logger.log('✅ Tokens saved/updated in tokens.json');
  }

  public getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  public async handleGoogleCallback(code: string): Promise<void> {
    try {
      this.logger.log('🔄 Exchanging code for tokens');
      const { tokens } = await this.oauth2Client.getToken(code);

      if (typeof tokens === 'string') {
        this.oauth2Client.setCredentials({ access_token: tokens });
        this.logger.log(
          '⚠️ Google tokens was a string, set as { access_token }',
        );
      } else {
        this.oauth2Client.setCredentials(tokens);
        this.logger.log('✅ Google tokens loaded as object.');
      }

      this.saveTokensToFile(tokens);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error handling Google callback: ${errMsg}`);
      throw error;
    }
  }

  public getClient(): OAuth2Client {
    return this.oauth2Client;
  }
}
