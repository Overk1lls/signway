export interface UserCreateDto {
  username: string;
  password: string;
  email?: string;
  name?: string;
}