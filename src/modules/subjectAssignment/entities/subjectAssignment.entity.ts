import { Remarks } from 'src/common/enums/remarkOptions.enum';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SubjectAssignment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ type: 'enum', enum: Remarks, default: Remarks.NoClockInRecord })
  remarks: Remarks;

  @ManyToOne(() => Subject, (sub) => sub.subjectAssignment)
  subjects: Subject;

  @ManyToOne(() => User, (user) => user.subjectAssignment)
  user: User;
}
