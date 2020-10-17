import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import {Category} from './Category';
import {Medium} from './Medium';
import {User} from './User';
import {QuestionAnswer} from './QuestionAnswer';

export type VerifiedLevel = -1 | 0 | 1;

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column('json')
  answers: string[];

  @Column('simple-array')
  correctAnswers: number[];

  @Column({type: 'smallint', default: 0})
  verifiedLevel: VerifiedLevel;

  @ManyToOne(() => User, u => u.verifiedQuestions)
  verifiedBy?: User;

  //#region relations
  @ManyToOne(() => User, u => u.questions)
  createdBy: User;

  @ManyToOne(() => Category, c => c.questions)
  category: Category;

  @ManyToOne(() => Medium, m => m.questions)
  medium: Medium;

  @OneToMany(() => QuestionAnswer, qa => qa.question)
  questionAnswers: QuestionAnswer[];
  //#endregion

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
