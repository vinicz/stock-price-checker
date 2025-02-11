import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockPrice } from './stock-price.entity';
import { StockPriceService } from './stock-price.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockPrice])],
  providers: [StockPriceService],
  exports: [StockPriceService],
})
export class StockPriceModule {}
