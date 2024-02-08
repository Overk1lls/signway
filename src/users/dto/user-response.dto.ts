import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}