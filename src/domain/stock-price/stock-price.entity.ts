import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockPriceDto } from './stock-price.dto';

@Entity()
export class StockPrice implements StockPriceDto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column({ type: 'real' })
  price: number;

  @CreateDateColumn({ type: 'timestamptz' })
  date: Date;
}
