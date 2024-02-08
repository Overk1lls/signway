import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

export const JWT_ISSUER = 'Signway';
export const JWT_AUDIENCE = 'users';
export const JWT_ALGORITHM = 'HS512';
export const JWT_EXPIRES_IN = '24h';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  
  createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
    return {
      global: true,
      secret: this.configService.get('JWT_SECRET_ACCESS'),
      signOptions: {
        expiresIn: JWT_EXPIRES_IN,
        audience: JWT_AUDIENCE,
        algorithm: JWT_ALGORITHM,
        issuer: JWT_ISSUER,
      },
    };
  }
}