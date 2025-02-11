import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockPrice } from './stock-price.entity';
import { StockPriceService } from './stock-price.service';
import { StockDataModule } from 'src/services/stock-data/stock-data.module';
import { MovingAverageCalculator } from './util/moving-average-calculator';

@Module({
  imports: [TypeOrmModule.forFeature([StockPrice]), StockDataModule],
  providers: [StockPriceService, MovingAverageCalculator],
  exports: [StockPriceService],
})
export class StockPriceModule {}
