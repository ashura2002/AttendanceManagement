import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { UserRecord } from 'src/modules/records/entities/record.entity';
import { SubjectAssignment } from 'src/modules/subjectAssignment/entities/subjectAssignment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
  attendanceStatus: Remarks;

  @Column({ type: 'enum', enum: Remarks, default: Remarks.Schedule })
  remarks: Remarks;

  @ManyToOne(() => SubjectAssignment, (assign) => assign.attendance)
  assignment: SubjectAssignment;

  @ManyToOne(() => User, (user) => user.attendance)
  user: User;

  @OneToMany(() => UserRecord, (record) => record.attendance)
  records: UserRecord[];
}
