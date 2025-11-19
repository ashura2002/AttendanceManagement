import { SubjectAssignment } from 'src/modules/subject-assignment/entities/subject-assignment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subjectName: string;

  @Column()
  controlNumber: number;

  @Column()
  subjectDescription: string;

  @Column()
  unit: number;

  @OneToMany(() => SubjectAssignment, (subAssign) => subAssign.subject)
  subjectAssignment: SubjectAssignment[];
}
