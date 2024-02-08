import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserAuthDto, UserCreateDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { JwtBearerScope } from './interfaces';
import { fullAccessScopes } from './strategies';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: UserAuthDto) {
    const user = await this.usersService.validateUser(dto);

    return await this.generateTokens(user.id);
  }

  async register(dto: UserCreateDto) {
    const user = await this.usersService.create(dto);

    return await this.generateTokens(user.id);
  }

  private async generateTokens(userId: string | number, scopes?: string[]) {
    return {
      accessToken: await this.jwtService.signAsync({
        sub: userId,
        scopes: scopes ?? fullAccessScopes,
      }),
      refreshToken: await this.jwtService.signAsync(
        {
          sub: userId,
          scopes: [JwtBearerScope.TokenRefresh],
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET_REFRESH'),
          expiresIn: '60d',
        },
      ),
    };
  }
}
