import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ChildEntity, TableInheritance} from 'typeorm';
import {Question} from './Question';
import {User} from './User';
import {MinLength, MaxLength} from 'class-validator';

@Entity()
@TableInheritance({column: {type: 'varchar', name: 'type'}})
export class Medium {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', select: false})
  type: string;

  //#region relations
  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => Question, q => q.medium)
  questions: Question[];
  //#endregion

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ChildEntity()
export class MediumPhoto extends Medium {
  @Column()
  path: string;
}

@ChildEntity()
export class MediumPassage extends Medium {
  @Column()
  @MinLength(10, {message: 'The passage is too short'})
  @MaxLength(2048, {message: 'The passage is too long'})
  body: string;
}
