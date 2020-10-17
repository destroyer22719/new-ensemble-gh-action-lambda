import {Entity, PrimaryColumn, ManyToOne, JoinColumn, Column} from 'typeorm';
import {Category} from './Category';

@Entity()
export class CategoryClosure {
  @PrimaryColumn({type: 'uuid', name: 'a'})
  @ManyToOne(() => Category)
  @JoinColumn({name: 'a'})
  a: Category;

  @PrimaryColumn({type: 'uuid', name: 'd'})
  @ManyToOne(() => Category)
  @JoinColumn({name: 'd'})
  d: Category;

  @Column('int')
  depth: number;
}
