import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './services/database/database.module';
import { StockPriceModule } from './domain/stock-price/stock-price.module';
import { V1Module } from './interface/v1/v1.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StockPriceUpdateScheduleModule } from './domain/stock-price-update-schedule/stock-price-update-schedule.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    StockPriceModule,
    StockPriceUpdateScheduleModule,
    V1Module,
  ],
  controllers: [AppController],
})
export class AppModule {}
