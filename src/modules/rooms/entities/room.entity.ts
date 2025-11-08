import { Building } from 'src/modules/buildings/entities/building.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @ManyToOne(() => Building, (building) => building.rooms)
  building: Building;
}
