import { AssignmentSubject } from 'src/modules/assignments/entities/assignment.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToMany(() => AssignmentSubject, (assign) => assign.subjects)
  assignments: AssignmentSubject[];
}
