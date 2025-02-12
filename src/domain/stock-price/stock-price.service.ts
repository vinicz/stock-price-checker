import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockPrice } from './stock-price.entity';
import { MoreThan, Repository } from 'typeorm';
import { StockPriceDto } from './stock-price.dto';
import { StockPriceWithMovingAverageDto } from './stock-price-with-moving-average.dto';
import { MovingAverageCalculator } from './util/moving-average-calculator';
import { StockDataService } from 'src/services/stock-data/stock-data.service';

const MOVING_AVERAGE_WINDOW_IN_MINUTES = 10;
const MOVING_AVERAGE_VALUE_AGGEREGATION_IN_MINUTES = 1;

@Injectable()
export class StockPriceService {
  constructor(
    @InjectRepository(StockPrice)
    private stockPriceRepository: Repository<StockPrice>,
    private movingAverageCalculator: MovingAverageCalculator,
    private stockDataService: StockDataService,
  ) {}

  async saveStockPrice(stockPrice: StockPriceDto): Promise<void> {
    await this.stockPriceRepository.save(stockPrice);
  }

  async getStockPriceForSymbol(
    symbol: string,
  ): Promise<StockPriceWithMovingAverageDto> {
    let lastPrice: StockPriceDto | null =
      await this.stockPriceRepository.findOne({
        where: {
          symbol,
        },
        order: {
          date: 'DESC',
        },
      });

    if (!lastPrice) {
      lastPrice = await this.stockDataService.fetchQuoteForSymbol(symbol);
      await this.saveStockPrice(lastPrice);
    }

    let movingAverage: number | null = null;

    const windowEnd = lastPrice.date;
    const windowStart = new Date(
      windowEnd.valueOf() - MOVING_AVERAGE_WINDOW_IN_MINUTES * 60 * 1000,
    );

    const recentPrices = await this.stockPriceRepository.find({
      where: {
        symbol,
        date: MoreThan(windowStart),
      },
      order: {
        date: 'DESC',
      },
    });

    const minimalValueCount =
      MOVING_AVERAGE_WINDOW_IN_MINUTES /
      MOVING_AVERAGE_VALUE_AGGEREGATION_IN_MINUTES /
      2;

    if (recentPrices.length > minimalValueCount) {
      movingAverage = this.movingAverageCalculator.calculateMovingAverage(
        recentPrices,
        windowStart,
        windowEnd,
        MOVING_AVERAGE_VALUE_AGGEREGATION_IN_MINUTES,
      );
    }

    return { ...lastPrice, movingAverage };
  }
}
