import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { ScheduleSubject } from 'src/common/enums/scheduleSubject.enum';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AssignmentSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true })
  daySchedule: ScheduleSubject[];

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ default: Remarks.Present })
  remarks: Remarks;

  @ManyToOne(() => User, (user) => user.subjectAssignments)
  user: User;

  @ManyToMany(() => Subject, (subject) => subject.assignments)
  @JoinTable()
  subjects: Subject[];

  @ManyToOne(() => Room, (room) => room.assign)
  room: Room;
}
