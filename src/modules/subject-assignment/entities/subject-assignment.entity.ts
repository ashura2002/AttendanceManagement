import { SubjectDays } from 'src/common/enums/scheduleSubject.enum';
import { Attendance } from 'src/modules/attendance/entities/attendance.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class SubjectAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subject, (subj) => subj.subjectAssignment)
  subject: Subject;

  @ManyToOne(() => Room, (room) => room.assignments)
  room: Room;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: SubjectDays, array: true })
  days: SubjectDays[];

  @ManyToOne(() => User, (user) => user.subjectAssignment)
  user: User;

  @OneToMany(() => Attendance, (attendance) => attendance.subjectAssignment)
  attendance: Attendance[];
}
