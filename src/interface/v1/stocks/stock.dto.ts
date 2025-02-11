import { Expose } from 'class-transformer';
import { StockPriceWithMovingAverageDto } from 'src/domain/stock-price/stock-price-with-moving-average.dto';

export class StockDto {
  @Expose()
  symbol: string;
  @Expose()
  price: number;
  @Expose()
  updatedAt: number;
  @Expose()
  movingAverage: number;

  static fromStockPrice(stockPrice: StockPriceWithMovingAverageDto): StockDto {
    return {
      symbol: stockPrice.symbol,
      price: stockPrice.price,
      movingAverage: stockPrice.movingAverage,
      updatedAt: stockPrice.date.valueOf(),
    };
  }
}
