import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { UserAuthDto, UserCreateDto, UserResponseDto } from './dto';
import { UserEntity } from './entities';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
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

  async findUserById(id: number) {
    const user = await this.userEntityRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id '${id}' does not exist`);
    }
    return this.formUserResponse(user);
  }

  async validateUser(dto: UserAuthDto) {
    const user = await this.userEntityRepository.findOneBy({ username: dto.username });
    if (!user) {
      throw new NotFoundException(`User with such username '${dto.username}' does not exist`);
    }

    const isPasswordValid = await compare(dto.password, user.hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are invalid');
    }

    return this.formUserResponse(user);
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
}
