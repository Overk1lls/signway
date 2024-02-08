export enum JwtBearerScope {
  UsersCreate = 'users:create',
  UsersRead = 'users:read',
  UsersUpdate = 'users:update',
  UsersDelete = 'users:delete',
  TokenRefresh = 'token:refresh',
}

export interface JwtPayload {
  sub: string;
  scopes: JwtBearerScope[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  jti: string;
}