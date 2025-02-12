import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { StockDataService } from './stock-data.service';

@Module({
  imports: [HttpModule],
  providers: [StockDataService],
  exports: [StockDataService],
})
export class StockDataModule {}
