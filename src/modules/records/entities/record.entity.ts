import { Attendance } from 'src/modules/attendances/entities/attendance.entity';
import { SubjectAssignment } from 'src/modules/subjectAssignment/entities/subjectAssignment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attendance, (attendance) => attendance.records)
  attendance: string;

  @ManyToOne(
    () => SubjectAssignment,
    (subjectAssignment) => subjectAssignment.records,
  )
  subjectAssignment: string;

  @ManyToOne(() => User, (user) => user.records)
  user: User;
}
