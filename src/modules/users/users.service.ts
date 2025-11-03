import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userRepo.find();
    return users;
  }

  async findByEmail(createUserDTO: CreateUserDTO): Promise<User> {
    const { email } = createUserDTO;
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async registerUser(createUserDTO: CreateUserDTO): Promise<User> {
    const { email, userName } = createUserDTO;
    const existEmail = await this.userRepo.findOne({
      where: { email },
    });
    const existUsername = await this.userRepo.findOne({
      where: { userName },
    });

    if (existEmail || existUsername)
      throw new BadRequestException('Bad request Credentials already exist');

    const user = this.userRepo.create(createUserDTO);
    return await this.userRepo.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
  }

  async updateUser(id: number, updateUser: UpdateUserDTO) {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found!');

    Object.assign(user, updateUser);
    return await this.userRepo.save(user);
  }
}
