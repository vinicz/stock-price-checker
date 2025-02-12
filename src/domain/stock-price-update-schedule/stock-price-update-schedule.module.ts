import { Module } from '@nestjs/common';
import { StockPriceModule } from '../stock-price/stock-price.module';
import { StockPriceUpdateScheduleService } from './stock-price-update-schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockPriceUpdateSchedule } from './stock-price-update-schedule.entity';
import { StockDataModule } from 'src/services/stock-data/stock-data.module';

@Module({
  imports: [
    StockPriceModule,
    TypeOrmModule.forFeature([StockPriceUpdateSchedule]),
    StockDataModule,
  ],
  providers: [StockPriceUpdateScheduleService],
  exports: [StockPriceUpdateScheduleService],
})
export class StockPriceUpdateScheduleModule {}
