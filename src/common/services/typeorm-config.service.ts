import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      url: this.configService.getOrThrow<string>('DATABASE_URL'),
      synchronize: false,
      logging: process.env.NODE_ENV === 'production' ? ['error'] : 'all',
      autoLoadEntities: true,
    };
  }
}