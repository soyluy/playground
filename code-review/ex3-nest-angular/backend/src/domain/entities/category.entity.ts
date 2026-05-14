import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';

import { AuctionItem } from './auction-item.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'categories' })
@Unique(['slug'])
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 140 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory!: Category | null;

  @OneToMany(() => Category, (category) => category.parentCategory, {
    eager: true,
  })
  children!: Category[];

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @OneToMany(() => AuctionItem, (item) => item.category)
  items!: AuctionItem[];
}
