import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Repository } from 'typeorm';
import { CreateBuildingDTO } from './dto/create-building.dto';
import { UpdateBuildingDTO } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
  ) {}

  async getAllBuildings(): Promise<Building[]> {
    const building = await this.buildingRepo.find();
    return building;
  }

  async createBuilding(dto: CreateBuildingDTO): Promise<Building> {
    const buildingName = await this.buildingRepo.findOne({
      where: { buildingName: dto.buildingName },
    });
    if (buildingName)
      throw new BadRequestException(`${dto.buildingName} is already exist`);
    const building = this.buildingRepo.create(dto);
    return await this.buildingRepo.save(building);
  }

  async updateBuilding(
    id: number,
    updateBuildingDTO: UpdateBuildingDTO,
  ): Promise<Building> {
    const building = await this.buildingRepo.findOne({
      where: { id },
    });
    if (!building) throw new NotFoundException('Building not found');
    Object.assign(building, updateBuildingDTO);
    return await this.buildingRepo.save(building);
  }

  async deleteBuilding(id: number): Promise<void> {
    const building = await this.buildingRepo.findOne({ where: { id } });
    if (!building) throw new NotFoundException('Building not found');
    await this.buildingRepo.remove(building);
  }

  async getBuildingById(id: number): Promise<Building> {
    const building = await this.buildingRepo.findOne({ where: { id } });
    if (!building) throw new NotFoundException('Building not found');
    return building;
  }
}
