import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigService, TypeOrmConfigService } from '../common/services';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authController: AuthController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        JwtModule.registerAsync({
          useClass: JwtConfigService,
        }),
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        RedisModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            type: 'single',
            url: configService.get<string>('REDIS_URL'),
          }),
          imports: [ConfigModule],
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register()', () => {
    it('should return JWT tokens', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test',
      });

      const result = await authController.register({
        username: 'test',
        email: 'test',
        password: 'test',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login()', () => {
    it('should return JWT tokens', async () => {
      jest.spyOn(usersService, 'validateUser').mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test',
      });

      const result = await authController.login({
        username: 'test',
        password: 'test',
      });

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
    });
  });
});
