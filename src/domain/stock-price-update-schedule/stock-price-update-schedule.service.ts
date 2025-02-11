import { InjectRepository } from '@nestjs/typeorm';
import { StockPriceUpdateSchedule } from './stock-price-update-schedule.entity';
import { DataSource, LessThan, Repository } from 'typeorm';
import { StockDataService } from 'src/services/stock-data/stock-data.service';
import { StockPriceService } from '../stock-price/stock-price.service';
import { Cron } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

export class StockPriceUpdateScheduleService {
  private readonly logger = new Logger(StockPriceUpdateScheduleService.name);
  constructor(
    @InjectRepository(StockPriceUpdateSchedule)
    private stockPriceUpdateScheduleRepository: Repository<StockPriceUpdateSchedule>,
    private stockDataService: StockDataService,
    private dataSource: DataSource,
    private stockPriceService: StockPriceService,
  ) {}

  async scheduleStockPriceUpdate(symbol: string) {
    const existingSchedule =
      await this.stockPriceUpdateScheduleRepository.findOne({
        where: { symbol },
      });

    if (existingSchedule) {
      return;
    }

    // Fetch the current stock price to ensure the symbol is valid
    const stockPrice = await this.stockDataService.fetchQuoteBySymbol(symbol);
    await this.stockPriceService.saveStockPrice(stockPrice);

    await this.stockPriceUpdateScheduleRepository.save({
      symbol,
    });
  }

  @Cron('0 * * * * *')
  async updateStockProces() {
    this.logger.log('Running stock price update process');

    const isMarketOpen = await this.stockDataService.checkIfMarketIsOpen();

    if (isMarketOpen) {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();
      let thereWasAStockToUpdate = true;
      const updateStartTime = new Date();
      const queryTimeWithSchedulingTreshold = new Date(Date.now() - 1000);

      try {
        while (thereWasAStockToUpdate) {
          await queryRunner.startTransaction();
          const transactionalStockPriceUpdateScheduleRepository =
            queryRunner.manager.getRepository(StockPriceUpdateSchedule);

          const stockToUpdate =
            await transactionalStockPriceUpdateScheduleRepository.findOne({
              where: {
                lastStartedAt: LessThan(queryTimeWithSchedulingTreshold),
              },
              lock: { mode: 'pessimistic_write' },
            });

          if (stockToUpdate) {
            this.logger.log(`Updating stock price for ${stockToUpdate.symbol}`);
            const runningSchedule =
              await transactionalStockPriceUpdateScheduleRepository.save({
                ...stockToUpdate,
                lastStartedAt: updateStartTime,
              });

            await queryRunner.commitTransaction();

            const currentStockPrice =
              await this.stockDataService.fetchQuoteBySymbol(
                runningSchedule.symbol,
              );
            await this.stockPriceService.saveStockPrice(currentStockPrice);

            this.logger.log(`Stock price updated for ${stockToUpdate.symbol}`);
          } else {
            thereWasAStockToUpdate = false;
            await queryRunner.commitTransaction();
          }
        }
      } catch {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
        this.logger.log('Stock price update process finished');
      }
    } else {
      this.logger.log('Market is closed, skipping stock price update');
    }
  }
}
