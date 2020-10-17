import {Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {Question} from './Question';
import {CategoryClosure} from './CategoryClosure';
import {User} from './User';
import {TestTemplate} from '../modules/tests/algo';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({type: 'json', nullable: true})
  template?: TestTemplate;

  //#region relations
  @OneToMany(() => Question, q => q.category)
  questions: Question[];

  @ManyToMany(() => User, u => u.subscribedCategories)
  subscribedBy: User[];
  //#endregion

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static closure = CategoryClosure;
}
