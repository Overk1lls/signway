import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheConfigService } from '../common/services';
import { UserEntity } from './entities';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
  ],
  providers: [
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
