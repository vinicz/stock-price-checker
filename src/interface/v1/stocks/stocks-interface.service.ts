import { Injectable } from '@nestjs/common';
import { StockPriceService } from 'src/domain/stock-price/stock-price.service';
import { StockDto } from './stock.dto';
import { StockPriceUpdateScheduleService } from 'src/domain/stock-price-update-schedule/stock-price-update-schedule.service';

@Injectable()
export class StocksInterfaceService {
  constructor(
    private stockPriceService: StockPriceService,
    private stockPriceUpdateScheduleService: StockPriceUpdateScheduleService,
  ) {}

  async scheduleStockPriceUpdate(symbol: string) {
    await this.stockPriceUpdateScheduleService.scheduleStockPriceUpdate(symbol);
  }

  async getStockPriceForSymbol(symbol: string) {
    const stockPrice =
      await this.stockPriceService.getStockPriceForSymbol(symbol);

    return StockDto.fromStockPrice(stockPrice);
  }
}
