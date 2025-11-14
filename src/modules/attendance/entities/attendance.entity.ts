import { AttendanceStatus } from 'src/common/enums/attendanceStatus.enum';
import { AssignmentSubject } from 'src/modules/assignments/entities/assignment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column()
  date: string;

  @ManyToOne(() => User, (user) => user.attendance)
  user: User;

  @ManyToOne(() => AssignmentSubject, (assignment) => assignment.attendance)
  assignment: AssignmentSubject;
}
