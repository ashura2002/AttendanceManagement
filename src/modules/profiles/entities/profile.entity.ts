import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  age: number;

  @Column()
  address: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column()
  contactNumber: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn() // owner must have the foriegn key
  user: User;
}
