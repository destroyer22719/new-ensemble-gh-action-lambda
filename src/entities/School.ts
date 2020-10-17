import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './User';

@Entity()
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  //#region relations
  @OneToMany(() => User, u => u.school)
  users: User[];
  //#endregion

}
