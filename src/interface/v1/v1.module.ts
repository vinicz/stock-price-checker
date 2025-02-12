import { Module } from '@nestjs/common';
import { StocksInterfaceModule } from './stocks/stocks-interface.module';

@Module({
  imports: [StocksInterfaceModule],
  exports: [StocksInterfaceModule],
})
export class V1Module {}
