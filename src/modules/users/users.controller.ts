import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/enums/Roles.enum';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AssignDeptDTO } from './dto/assignDep.dto';

@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getAllUsers(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get('current')
  @HttpCode(HttpStatus.OK)
  async currentUser(@Req() req): Promise<User> {
    const { userId } = req.user;
    return await this.userService.currentUser(userId);
  }

  @Get('all-employees')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async getAllUsersWithEmployeeRole(): Promise<User[]> {
    return await this.userService.getAllUsersWithEmployeeRoles();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    return await this.userService.updateUser(id, updateUserDTO);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.userService.delete(id);
  }

  @Patch(':id/departments')
  @HttpCode(HttpStatus.OK)
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  async assignTo(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDTO: AssignDeptDTO,
  ): Promise<User> {
    const { userId } = req.user;
    return this.userService.assignUserToDepartment(id, updateUserDTO, userId);
  }
}
