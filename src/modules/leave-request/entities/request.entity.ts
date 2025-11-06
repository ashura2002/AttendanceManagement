import { LeaveStatus, ResultStatus } from 'src/common/enums/leaveStatus.enum';
import { LeaveType } from 'src/common/enums/leaveType.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LeaveType,
    default: LeaveType.PERSONAL,
  })
  leaveType: LeaveType;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.Pending_HR })
  views: LeaveStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  totalLeaveDays: number;

  @Column({ type: 'enum', enum: ResultStatus, default: ResultStatus.Pending })
  finalStatus: ResultStatus;

  @ManyToOne(() => User, (user) => user.requests)
  user: User;
}
