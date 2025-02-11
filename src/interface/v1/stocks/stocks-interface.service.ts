import { Injectable } from '@nestjs/common';
import { StockPriceService } from 'src/domain/stock-price/stock-price.service';
import { StockDto } from './stock.dto';

@Injectable()
export class StocksInterfaceService {
  constructor(private stockPriceService: StockPriceService) {}

  async getStockPriceForSymbol(symbol: string) {
    const stockPrice =
      await this.stockPriceService.getStockPriceForSymbol(symbol);

    return StockDto.fromStockPrice(stockPrice);
  }
}
