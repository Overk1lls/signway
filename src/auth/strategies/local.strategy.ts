import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(username: string, password: string) {
    return await this.usersService.validateUser({ username, password });
  }
}
