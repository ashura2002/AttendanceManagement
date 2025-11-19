import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { SubjectAssignment } from 'src/modules/subject-assignment/entities/subject-assignment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', nullable: true })
  timeIn: string;

  @Column({ type: 'time', nullable: true })
  timeOut: string;

  @Column({ type: 'float', default: 0 })
  totalHours: number;

  @Column({ type: 'enum', enum: Remarks, default: Remarks.NoClockInRecord })
  status: Remarks;

  @Column({ type: 'enum', enum: Remarks, default: Remarks.Schedule })
  remarks: Remarks;

  @ManyToOne(() => SubjectAssignment, (assignment) => assignment.attendance)
  subjectAssignment: SubjectAssignment;

  @ManyToOne(() => User, (user) => user.attendance)
  user: User;
}
