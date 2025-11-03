import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  departmentName: string;

  @Column()
  description: string;

  @OneToMany(() => User, (user) => user.department)
  employees: User[];
}
