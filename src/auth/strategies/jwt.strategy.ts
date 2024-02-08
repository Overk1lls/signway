import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ALGORITHM, JWT_AUDIENCE, JWT_EXPIRES_IN, JWT_ISSUER } from '../../common/services';
import { UsersService } from '../../users/users.service';
import { JwtBearerScope, JwtPayload } from '../interfaces';

export const jwtScopeStrings = Object.values(JwtBearerScope);
export const fullAccessScopes = Object.values(JwtBearerScope).filter((s) => s !== JwtBearerScope.TokenRefresh);
export const fullUserScopes = Object.values(JwtBearerScope).filter((s) => s.startsWith('users:'));

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,  
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET_ACCESS'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!fullAccessScopes.every((s) => payload.scopes.includes(s))) {
      throw new ForbiddenException('You are not permitted to perform this action');
    }

    return await this.usersService.findUserById(+payload.sub);
    return {
      userId: payload.sub,
      jti: payload.jti,
      scopes: payload.scopes,
    };
  }
}