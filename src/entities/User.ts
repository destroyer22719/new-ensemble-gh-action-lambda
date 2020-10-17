import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, ChildEntity, TableInheritance, ManyToMany, JoinTable} from 'typeorm';
import {Article} from './Article';
import {Category} from './Category';
import {Question} from './Question';
import {QuestionAnswer} from './QuestionAnswer';
import {School} from './School';

export const UserRole = ['none', 'student', 'teacher', 'schoolAdmin', 'admin'] as const;

@Entity()
@TableInheritance({column: {type: 'varchar', name: 'type'}})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  avatarUrl: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: 'none',
  })
  role: typeof UserRole[number];

  //#region relations
  @OneToMany(() => Question, c => c.createdBy)
  questions: Question[];

  @OneToMany(() => Question, c => c.verifiedBy)
  // questions this user has verified if they have the perms
  verifiedQuestions: Question[];

  @OneToMany(() => QuestionAnswer, qa => qa.answeredBy)
  questionAnswers: QuestionAnswer[];

  @OneToMany(() => Article, a => a.createdBy)
  articles: Article[];

  @ManyToOne(() => School, s => s.users)
  school: School;

  @ManyToMany(() => Category, c => c.subscribedBy)
  @JoinTable()
  subscribedCategories: Category[];
  //#endregion

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ChildEntity()
export class UserLocal extends User {
  @Column({select: false})
  password: string;
}

@ChildEntity()
export class UserSocial extends User {
  @Column()
  socialId: string;
}
