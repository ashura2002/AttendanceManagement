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
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/enums/Roles.enum';
import { DepartmentsService } from '../departments/departments.service';
import { AssignDeptDTO } from './dto/assignDep.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly departmentService: DepartmentsService,
    private readonly notifService: NotificationService,
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
      relations: ['department'],
      select: {
        department: {
          departmentName: true,
          description: true,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUserName(userName: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { userName },
    });

    if (!user) throw new NotFoundException('User not found with this username');
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

    const validRoles = Object.values(Roles);
    if (!validRoles.includes(createUserDTO.role)) {
      throw new BadRequestException(
        `${createUserDTO.role} is an invalid role.`,
      );
    }
    const user = this.userRepo.create(createUserDTO);
    return await this.userRepo.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
  }

  async updateUser(id: number, updateUser: UpdateUserDTO): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found!');

    if (updateUser.password) {
      const hashPassword = await bcrypt.hash(updateUser.password, 10);
      updateUser.password = hashPassword;
    }

    Object.assign(user, updateUser);
    return await this.userRepo.save(user);
  }

  async currentUser(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!user) throw new NotFoundException('User not exist');
    return user;
  }

  async assignUserToDepartment(
    userId: number,
    updateUserDTO: AssignDeptDTO,
  ): Promise<User> {
    const { department } = updateUserDTO;
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['department'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (department) {
      const dept = await this.departmentService.getById(department);
      user.department = dept;
      await this.notifService.createNotification({
        message: `You are now part of ${dept.departmentName} department.`,
        user: user.id,
      });
    }

    return this.userRepo.save(user);
  }
}
