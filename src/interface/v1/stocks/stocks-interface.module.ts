import { Module } from '@nestjs/common';
import { StockPriceModule } from 'src/domain/stock-price/stock-price.module';
import { StocksInterfaceController } from './stocks-interface.controller';
import { StocksInterfaceService } from './stocks-interface.service';

@Module({
  imports: [StockPriceModule],
  controllers: [StocksInterfaceController],
  providers: [StocksInterfaceService],
})
export class StocksInterfaceModule {}
