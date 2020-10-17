import {Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn} from 'typeorm';
import {UserRole} from './User';

@Entity()
@TableInheritance({column: {type: 'varchar', name: 'type'}})
export class InviteCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  @Generated('uuid')
  code: string;

  @Column('json')
  // eslint-disable-next-line max-len
  data: {role?: typeof UserRole[number], relations?: {schoolId?: string}}; // {role: 'schoolAdmin', relations: {school: '123'}}}

  @Column({default: true})
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
