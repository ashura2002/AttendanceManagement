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
import { DecisionDTO } from './dto/decision.dto';

@Controller('leave-request')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('access-token')
export class LeaveRequestController {
  constructor(private readonly leaveService: LeaveRequestService) {}

  @customRoleDecorator(Roles.Employee)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createLeaveRequest(
    @Req() req,
    @Body() dto: CreateLeaveRequestDTO,
  ): Promise<Request> {
    const { userId } = req.user;
    return await this.leaveService.createLeaveForm(userId, dto);
  }

  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllRequest(@Req() req): Promise<Request[]> {
    const { role } = req.user;
    return await this.leaveService.getAllRequest(role);
  }

  @customRoleDecorator(Roles.Employee)
  @HttpCode(HttpStatus.OK)
  @Get('own-request')
  async getOwnRequest(@Req() req): Promise<Request[]> {
    const { userId } = req.user;
    return await this.leaveService.getOwnRequest(userId);
  }

  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async decision(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: DecisionDTO,
  ): Promise<Request> {
    const { userId } = req.user;
    return await this.leaveService.decision(id, userId, dto);
  }

  @customRoleDecorator(Roles.Employee)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteOwnRequest(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.leaveService.deleteOwnRequest(id);
  }
}
