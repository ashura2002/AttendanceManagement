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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { BuildingService } from './buildings.service';
import { customRoleDecorator } from 'src/common/decorators/Roles.decorator';
import { Roles } from 'src/common/enums/Roles.enum';
import { Building } from './entities/building.entity';
import { CreateBuildingDTO } from './dto/create-building.dto';
import { UpdateBuildingDTO } from './dto/update-building.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('buildings')
@UseGuards(JwtAuthGuard, RoleGuard)
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Get()
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.OK)
  async getAllBuildings(): Promise<Building[]> {
    return await this.buildingService.getAllBuildings();
  }

  @Post()
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.OK)
  async createBuilding(@Body() dto: CreateBuildingDTO): Promise<Building> {
    return await this.buildingService.createBuilding(dto);
  }

  @Patch(':id')
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.OK)
  async updateBuilding(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBuildingDTO: UpdateBuildingDTO,
  ): Promise<Building> {
    return await this.buildingService.updateBuilding(id, updateBuildingDTO);
  }

  @Delete(':id')
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBuilding(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.buildingService.deleteBuilding(id);
  }

  @Get(':id')
  @customRoleDecorator(Roles.Admin, Roles.Hr, Roles.ProgramHead)
  @HttpCode(HttpStatus.OK)
  async getBuildingById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Building> {
    return await this.buildingService.getBuildingById(id);
  }
}
