import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import { Repository } from 'typeorm';
import { TypeOrmConfigService } from '../common/services';
import { UserEntity } from './entities';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersEntityRepository: Repository<UserEntity>;
  
  const password = '12345test';
  const saltOrRounds = 10;
  const decryptedPw = hashSync(password, saltOrRounds);
  const user: UserEntity = {
    id: 1,
    email: 'test',
    hash: decryptedPw,
    name: 'test',
    username: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersEntityRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  describe('create()', () => {
    it('should create a user', async () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(undefined);
      jest.spyOn(usersEntityRepository, 'save').mockResolvedValueOnce(user);

      const result = await usersService.create({
        password,
        email: user.email,
        name: user.name,
        username: user.username,
      });

      expect(result).toMatchObject({
        email: user.email,
        name: user.name,
        username: user.username,
      });
    });

    it('should throw an error if user already exists', () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(user);

      expect(() => usersService.create({ ...user, password: '123' })).rejects.toThrowError(ConflictException);
    });
  });

  describe('findUserById()', () => {
    it('should return a user', async () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(user);

      const result = await usersService.findUserById(user.id);

      expect(result).toMatchObject({
        email: user.email,
        name: user.name,
        username: user.username,
      });
    });

    it('should throw the NotFound exception', () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(undefined);

      expect(() => usersService.findUserById(user.id)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('validateUser()', () => {
    it('should successfully validate', async () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(user);

      const result = await usersService.validateUser({
        password,
        username: user.username,
      });

      expect(result).toMatchObject({
        email: user.email,
        name: user.name,
        username: user.username,
      });
    });

    it('should throw the NotFound exception', () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(undefined);

      expect(() => usersService.validateUser({ password, username: '123' })).rejects.toThrowError(NotFoundException);
    });

    it('should throw the Unauthorized exception', () => {
      jest.spyOn(usersEntityRepository, 'findOneBy').mockResolvedValueOnce(user);

      expect(() => usersService.validateUser({ password: '123', username: '123' })).rejects.toThrowError(UnauthorizedException);
    });
  });
});
