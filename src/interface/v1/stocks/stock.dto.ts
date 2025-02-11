import { Expose } from 'class-transformer';
import { StockPrice } from 'src/domain/stock-price/stock-price.entity';

export class StockDto {
  @Expose()
  symbol: string;
  @Expose()
  price: number;
  @Expose()
  updatedAt: number;

  static fromStockPrice(stockPrice: StockPrice): StockDto {
    return {
      symbol: stockPrice.symbol,
      price: stockPrice.price,
      updatedAt: stockPrice.date.valueOf(),
    };
  }
}
