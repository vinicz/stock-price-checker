import { Expose } from 'class-transformer';

export class StockQuoteDto {
  @Expose()
  c: number;

  @Expose()
  t: number;
}
