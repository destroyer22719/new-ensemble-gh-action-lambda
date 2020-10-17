import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {Question} from './Question';
import {User} from './User';

@Entity()
export class QuestionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isCorrect: boolean;

  //#region relations

  @ManyToOne(() => Question, q => q.questionAnswers)
  question: Question;

  @ManyToOne(() => User, u => u.questionAnswers)
  answeredBy: User;

  //#endregion

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
