import { Controller, Get, Header, Param, Put } from '@nestjs/common';
import { VERSION } from '../constants';
import { StocksInterfaceService } from './stocks-interface.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { StockDto } from './stock.dto';

const STOCKS_PATH = `/stocks`;

@Controller({ version: [VERSION], path: STOCKS_PATH })
export class StocksInterfaceController {
  constructor(
    private readonly stocksInterfaceService: StocksInterfaceService,
  ) {}

  @ApiOperation({
    summary: 'Get the stock price',
    description: 'Get the stock price for the given symbol.',
  })
  @ApiParam({
    description: 'The symbol of the stock',
    example: 'AAPL',
    name: 'symbol',
  })
  @ApiResponse({
    status: 200,
    type: StockDto,
    description:
      'Stock price for the given symbol. If the moving average is null, it means that there are not enough data points to calculate it. Schedule a price update to get more data points.',
  })
  @ApiResponse({
    status: 404,
    description: 'The stock price for the symbol could not be found',
  })
  @Get(`:symbol`)
  @Header('content-type', 'application/json')
  getStockPrice(
    @Param('symbol')
    symbol: string,
  ) {
    return this.stocksInterfaceService.getStockPriceForSymbol(symbol);
  }

  @ApiOperation({
    summary: 'Schedule stock price update',
    description:
      'If a stock price update is scheduled then it will be updated every minute. This data is used for moving average calculation.',
  })
  @ApiParam({
    description: 'The symbol of the stock',
    example: 'AAPL',
    name: 'symbol',
  })
  @ApiResponse({
    status: 200,
    description: 'The price update for the symbol has been scheduled',
  })
  @ApiResponse({
    status: 404,
    description: 'The stock price for the symbol could not be found',
  })
  @Put(`:symbol`)
  @Header('content-type', 'application/json')
  async scheduleStockPriceUpdate(@Param('symbol') symbol: string) {
    await this.stocksInterfaceService.scheduleStockPriceUpdate(symbol);
    return { status: 'ok' };
  }
}
