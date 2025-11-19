import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { SubjectDays } from 'src/common/enums/scheduleSubject.enum';
import { Attendance } from 'src/modules/attendances/entities/attendance.entity';
import { UserRecord } from 'src/modules/records/entities/record.entity';
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

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: SubjectDays, array: true })
  days: SubjectDays[];

  @ManyToOne(() => Subject, (sub) => sub.subjectAssignment)
  subjects: Subject;

  @ManyToOne(() => Room, (room) => room.assignments)
  room: Room;

  @ManyToOne(() => User, (user) => user.subjectAssignment)
  user: User;

  @OneToMany(() => Attendance, (attendance) => attendance.assignment)
  attendance: Attendance

  @OneToMany(() => UserRecord, (record) => record.subjectAssignment)
  records:UserRecord[]
}
