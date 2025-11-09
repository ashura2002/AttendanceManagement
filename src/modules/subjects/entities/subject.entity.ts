import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
