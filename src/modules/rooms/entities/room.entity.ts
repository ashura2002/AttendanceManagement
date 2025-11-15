import { Building } from 'src/modules/buildings/entities/building.entity';
import { SubjectAssignment } from 'src/modules/subjectAssignment/entities/subjectAssignment.entity';
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

  @OneToMany(() => SubjectAssignment, (subAssignment) => subAssignment.room)
  assignments: SubjectAssignment;
}
