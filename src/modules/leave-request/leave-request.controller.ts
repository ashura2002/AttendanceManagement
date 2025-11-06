import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LeaveRequestService } from './leave-request.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { CreateLeaveRequestDTO } from './dto/create-request.dto';
import { Request } from './entities/request.entity';

@Controller('leave-request')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('access-token')
export class LeaveRequestController {
  constructor(private readonly leaveService: LeaveRequestService) {}

  @customRoleDecorator(Roles.Employee)
  @Post()
  async createLeaveRequest(
    @Req() req,
    @Body() dto: CreateLeaveRequestDTO,
  ): Promise<Request> {
    const { userId } = req.user;
    return await this.leaveService.createLeaveForm(userId, dto);
  }

  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @Get()
  async getAllRequest(@Req() req): Promise<Request[]> {
    const { role } = req.user;
    return await this.leaveService.getAllRequest(role);
  }

  @customRoleDecorator(Roles.Employee)
  @Get('own-request')
  async getOwnRequest(@Req() req): Promise<Request[]> {
    const { userId } = req.user;
    return await this.leaveService.getOwnRequest(userId);
  }

  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @Patch(':id')
  async decision(): Promise<any> {
  
  }
}
