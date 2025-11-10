import { AssignmentSubject } from 'src/modules/assignments/entities/assignment.entity';
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

  @OneToMany(() => AssignmentSubject, (assign) => assign.subject)
  assignments: AssignmentSubject[];
}
