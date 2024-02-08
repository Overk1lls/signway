import { CanActivate, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { TokensResponseDto } from '../src/auth/dto';
import { LocalAuthGuard } from '../src/auth/guards';
import { JwtConfigService, TypeOrmConfigService } from '../src/common/services';

const tokens: TokensResponseDto = {
  accessToken: 'at',
  refreshToken: 'rt',
};

describe('AuthController', () => {
  let app: INestApplication;
  const authService = {
    register: () => tokens,
    login: () => tokens,
  };
  const authGuard: CanActivate = {
    canActivate: () => true,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
        }),
        JwtModule.registerAsync({
          useClass: JwtConfigService,
        }),
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
        })
      ],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideGuard(LocalAuthGuard)
      .useValue(authGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('register()', () => {
    it('should successfully register', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test',
          password: 'test',
          email: 'test',
          name: 'test',
        })
        .expect(201)
        .expect(authService.register());
    });
  });

  describe('login()', () => {
    it('should successfully sign in', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'test',
        })
        .expect(200)
        .expect(authService.login());
    });
  });

  afterAll(async () => {
    await app.close();
  });
});