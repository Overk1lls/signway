import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from './decorators';
import { UserResponseDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getProfile(@CurrentUser() user: UserResponseDto) {
    return user;
  }
}
