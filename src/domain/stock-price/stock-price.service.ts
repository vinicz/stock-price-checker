import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockPrice } from './stock-price.entity';
import { MoreThan, Repository } from 'typeorm';
import { StockPriceDto } from './stock-price.dto';
import { StockPriceWithMovingAverageDto } from './stock-price-with-moving-average.dto';
import { MovingAverageCalculator } from './util/moving-average-calculator';

@Injectable()
export class StockPriceService {
  constructor(
    @InjectRepository(StockPrice)
    private stockPriceRepository: Repository<StockPrice>,
    private movingAverageCalculator: MovingAverageCalculator,
  ) {}

  async saveStockPrice(stockPrice: StockPriceDto): Promise<void> {
    await this.stockPriceRepository.save(stockPrice);
  }

  async getStockPriceForSymbol(
    symbol: string,
  ): Promise<StockPriceWithMovingAverageDto> {
    const lastPrice = await this.stockPriceRepository.findOne({
      where: {
        symbol,
      },
      order: {
        date: 'DESC',
      },
    });

    if (!lastPrice) {
      throw new NotFoundException(`No stock prices found for symbol ${symbol}`);
    }

    const windowEnd = lastPrice.date;
    const windowStart = new Date(windowEnd.valueOf() - 10 * 60 * 1000);

    const recentPrices = await this.stockPriceRepository.find({
      where: {
        symbol,
        date: MoreThan(windowStart),
      },
      order: {
        date: 'DESC',
      },
    });

    const average = this.movingAverageCalculator.calculateMovingAverage(
      recentPrices,
      windowStart,
      windowEnd,
      1,
    );

    return { ...recentPrices[0], movingAverage: average };
  }
}
