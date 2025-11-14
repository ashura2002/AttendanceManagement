import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { AssignmentSubject } from 'src/modules/assignments/entities/assignment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Remarks })
  status: Remarks;

  @Column()
  date: string;

  @Column({ type: 'timestamptz', nullable: true })
  timeIn: Date;

  @Column({ nullable: true })
  timeOut: Date;

  @Column({ type: 'float', nullable: true })
  totalHours: number; // total duty hours

  @ManyToOne(() => User, (user) => user.attendance)
  user: User;

  @ManyToOne(() => AssignmentSubject, (assignment) => assignment.attendance)
  assignment: AssignmentSubject;
}
