import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}
