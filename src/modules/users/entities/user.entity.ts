import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/enums/Roles.enum';
import { Department } from 'src/modules/departments/entities/department.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Request } from 'src/modules/leave-request/entities/request.entity';
import { Profile } from 'src/modules/profiles/entities/profile.entity';
import { SubjectAssignment } from 'src/modules/subjectAssignment/entities/subjectAssignment.entity';
import { Attendance } from 'src/modules/attendances/entities/attendance.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userName: string;

  @Column()
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.Employee,
  })
  role: Roles;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Department, (department) => department.employees, {
    nullable: true,
  })
  department?: Department;

  @OneToMany(() => Notification, (notif) => notif.user, { nullable: true })
  notifications: Notification[];

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToOne(() => User, (user) => user.profile)
  profile: Profile;

  @OneToMany(() => SubjectAssignment, (subAssignment) => subAssignment.user)
  subjectAssignment: SubjectAssignment[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendance: Attendance[];

  @Column({ type: 'int', default: 160 })
  leaveCredits: number;
}
