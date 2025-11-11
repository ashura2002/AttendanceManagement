import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { ScheduleSubject } from 'src/common/enums/scheduleSubject.enum';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AssignmentSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-array' })
  daySchedule: ScheduleSubject[];

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ default: Remarks.Present })
  remarks: Remarks;

  @ManyToOne(() => User, (user) => user.subjectAssignments)
  user: User;

  @ManyToOne(() => Subject, (sub) => sub.assignments)
  subject: Subject;
}
