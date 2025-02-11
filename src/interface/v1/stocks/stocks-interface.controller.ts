import { Controller, Get, Header, Param, Put } from '@nestjs/common';
import { VERSION } from '../constants';
import { StocksInterfaceService } from './stocks-interface.service';

const STOCKS_PATH = `/stocks`;

@Controller({ version: [VERSION], path: STOCKS_PATH })
export class StocksInterfaceController {
  constructor(
    private readonly stocksInterfaceService: StocksInterfaceService,
  ) {}

  @Get(`:symbol`)
  @Header('content-type', 'application/json')
  getStockPrice(@Param('symbol') symbol: string) {
    return this.stocksInterfaceService.getStockPriceForSymbol(symbol);
  }

  @Put(`:symbol`)
  @Header('content-type', 'application/json')
  async scheduleStockPriceUpdate(@Param('symbol') symbol: string) {
    await this.stocksInterfaceService.scheduleStockPriceUpdate(symbol);
    return { status: 'ok' };
  }
}
