import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { SubjectAssignment } from 'src/modules/subjectAssignment/entities/subjectAssignment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time' })
  timeIn: string;

  @Column({ type: 'time', nullable: true })
  timeOut: string;

  @Column({ type: 'float', nullable: true })
  totalHours: number;

  @Column({ type: 'enum', enum: Remarks, default: Remarks.Absent })
  status: Remarks;

  @ManyToOne(() => User, (user) => user.attendances)
  user: User;

  @ManyToOne(
    () => SubjectAssignment,
    (subjectAssignment) => subjectAssignment.attendances,
  )
  subjectAssignment: SubjectAssignment;
}
