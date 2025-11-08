import { Room } from 'src/modules/rooms/entities/room.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  buildingName: string;

  @Column({ default: 'Svc Main Campus' })
  location: string;

  @OneToMany(() => Room, (room) => room.building)
  rooms: Room[];
}
