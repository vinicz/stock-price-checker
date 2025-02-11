import { Controller, Get, Header, Param } from '@nestjs/common';
import { VERSION_PREFIX } from '../constants';
import { StocksInterfaceService } from './stocks-interface.service';

const STOCKS_PATH = `${VERSION_PREFIX}/stocks`;

@Controller(STOCKS_PATH)
export class StocksInterfaceController {
  constructor(
    private readonly stocksInterfaceService: StocksInterfaceService,
  ) {}

  @Get(`:symbol`)
  @Header('content-type', 'application/json')
  rules(@Param('symbol') symbol: string) {
    return this.stocksInterfaceService.getStockPriceForSymbol(symbol);
  }
}
