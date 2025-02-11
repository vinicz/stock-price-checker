import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockPrice } from './stock-price.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StockPriceService {
  constructor(
    @InjectRepository(StockPrice)
    private stockPriceRepository: Repository<StockPrice>,
  ) {}

  async getStockPriceForSymbol(symbol: string): Promise<StockPrice> {
    const foundStockPrice = await this.stockPriceRepository.findOne({
      where: { symbol },
    });

    if (!foundStockPrice) {
      throw new NotFoundException();
    }

    return foundStockPrice;
  }
}
