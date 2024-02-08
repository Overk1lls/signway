import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserAuthDto, UserCreateDto } from '../users/dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    description: 'Login data',
    examples: {
      'application/json': {
        value: {
          username: 'username',
          password: 'password',
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() userAuthDto: UserAuthDto) {
    return await this.authService.login(userAuthDto);
  }

  @ApiBody({
    description: 'User data',
    examples: {
      'application/json': {
        value: {
          username: 'username',
          password: 'password',
          email: 'email',
          name: 'name',
        },
      },
    },
    required: true,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() userCreateDto: UserCreateDto) {
    return await this.authService.register(userCreateDto);
  }
}
