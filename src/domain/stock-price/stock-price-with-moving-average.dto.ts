import { StockPriceDto } from './stock-price.dto';

export class StockPriceWithMovingAverageDto extends StockPriceDto {
  movingAverage: number | null;
}
