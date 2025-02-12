import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { StockPriceWithMovingAverageDto } from 'src/domain/stock-price/stock-price-with-moving-average.dto';

export class StockDto {
  @ApiProperty()
  @Expose()
  symbol: string;
  @ApiProperty()
  @Expose()
  price: number;
  @ApiProperty()
  @Expose()
  updatedAt: number;
  @ApiProperty()
  @Expose()
  movingAverage: number | null;

  static fromStockPrice(stockPrice: StockPriceWithMovingAverageDto): StockDto {
    return {
      symbol: stockPrice.symbol,
      price: stockPrice.price,
      movingAverage: stockPrice.movingAverage,
      updatedAt: stockPrice.date.valueOf(),
    };
  }
}
