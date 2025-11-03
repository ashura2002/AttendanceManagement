import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/enums/Roles.enum';
import { Department } from 'src/modules/departments/entities/department.entity';

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

  @ManyToOne(() => Department, (department) => department.employees, {
    nullable: true,
  })
  department?: Department;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}

// todo -> finish the department modules
//         add swagger UI