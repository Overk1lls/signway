import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigService, TypeOrmConfigService } from '../common/services';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register()', () => {
    it('should return JWT tokens', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue({
        accessToken: 'test',
        refreshToken: 'test',
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
      jest.spyOn(authService, 'login').mockResolvedValue({
        accessToken: 'test',
        refreshToken: 'test',
      });

      const result = await authController.login({
        username: 'test',
        password: 'test',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
