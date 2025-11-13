import { AssignmentSubject } from 'src/modules/assignments/entities/assignment.entity';
import { Building } from 'src/modules/buildings/entities/building.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @ManyToOne(() => Building, (building) => building.rooms)
  building: Building;

  @OneToMany(() => AssignmentSubject, (assign) => assign.room)
  assign: AssignmentSubject;
}
