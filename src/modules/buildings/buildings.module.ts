import { Module } from "@nestjs/common";
import { BuildingController } from "./buildings.controller";
import { BuildingService } from "./buildings.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Building } from "./entities/building.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports:[TypeOrmModule.forFeature([Building]), JwtModule],
    controllers:[BuildingController],
    providers:[BuildingService],
    exports:[BuildingService]
})
export class BuildingModule{}