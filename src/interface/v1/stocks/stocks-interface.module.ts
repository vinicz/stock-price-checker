import { Module } from '@nestjs/common';
import { StockPriceModule } from 'src/domain/stock-price/stock-price.module';
import { StocksInterfaceController } from './stocks-interface.controller';
import { StocksInterfaceService } from './stocks-interface.service';
import { StockPriceUpdateScheduleModule } from 'src/domain/stock-price-update-schedule/stock-price-update-schedule.module';

@Module({
  imports: [StockPriceModule, StockPriceUpdateScheduleModule],
  controllers: [StocksInterfaceController],
  providers: [StocksInterfaceService],
})
export class StocksInterfaceModule {}
