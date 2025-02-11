import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class StockPriceUpdateSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @CreateDateColumn({ type: 'timestamptz' })
  lastStartedAt: Date;
}
