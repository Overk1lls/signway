import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';
import { UserAuthDto, UserCreateDto, UserResponseDto } from './dto';
import { UserEntity } from './entities';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,

    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async create(dto: UserCreateDto) {
    const user = await this.userEntityRepository.findOneBy([
      { username: dto.username },
      { email: dto.email },
    ]);
    if (user) {
      throw new ConflictException(`Such user already exists`);
    }

    const hash = await this.hashPassword(dto.password);
    const newUser = await this.userEntityRepository.save({ ...dto, hash });

    return this.formUserResponse(newUser);
  }

  async findUserById(id: number): Promise<UserResponseDto> {
    const cachedKey = this.getCachedKey(id);
    const cachedUser = await this.redis.get(cachedKey);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.userEntityRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id '${id}' does not exist`);
    }

    const response = this.formUserResponse(user);

    await this.cacheUser(
      cachedKey,
      response,
      this.configService.get('REDIS_TTL', 300),
    );

    return response;
  }

  async validateUser(dto: UserAuthDto): Promise<UserResponseDto> {
    const cachedKey = this.getCachedKey(dto.username);
    const cachedUser = await this.redis.get(cachedKey);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.userEntityRepository.findOneBy({
      username: dto.username,
    });
    if (!user) {
      throw new NotFoundException(
        `User with such username '${dto.username}' does not exist`,
      );
    }

    const isPasswordValid = await compare(dto.password, user.hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are invalid');
    }

    const response = this.formUserResponse(user);

    await this.cacheUser(
      cachedKey,
      response,
      this.configService.get('REDIS_TTL', 300),
    );

    return response;
  }

  private async hashPassword(password: string) {
    const saltOrRounds = +this.configService.get('SALT_OR_ROUNDS', 10);
    return await hash(password, saltOrRounds);
  }

  private formUserResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };
  }

  private async cacheUser(key: string, user: UserResponseDto, ttl = 300) {
    return await this.redis.set(key, JSON.stringify(user), 'EX', ttl);
  }

  private getCachedKey(idOrUsername: string | number): string {
    return `user:${idOrUsername}`;
  }
}
