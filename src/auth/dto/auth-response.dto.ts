import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { UserResponseDto } from '../../users/dto';

export class TokensResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthResponseDto {
  @IsNotEmpty()
  @IsObject()
  user: UserResponseDto;

  @IsNotEmpty()
  @IsObject()
  tokens: TokensResponseDto;
}