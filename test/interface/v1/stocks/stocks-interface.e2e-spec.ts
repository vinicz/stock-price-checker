import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import { StockDataService } from 'src/services/stock-data/stock-data.service';
import { StockPriceDto } from 'src/domain/stock-price/stock-price.dto';
import { DataSource, Repository } from 'typeorm';
import { StockPrice } from 'src/domain/stock-price/stock-price.entity';
import { StockDto } from 'src/interface/v1/stocks/stock.dto';
import { StockPriceUpdateSchedule } from 'src/domain/stock-price-update-schedule/stock-price-update-schedule.entity';

describe('Stocks interface (e2e)', () => {
  let app: INestApplication<App>;
  let stockPriceRepository: Repository<StockPrice>;
  let stockPriceUpdateScheduleRepository: Repository<StockPriceUpdateSchedule>;

  const mockStockDataApiResponse: StockPriceDto = {
    symbol: 'AAPL',
    price: 100,
    date: new Date(),
  };

  const mockStockDataService = {
    checkIfMarketIsOpen: jest.fn().mockResolvedValue(true),
    fetchQuoteForSymbol: jest.fn().mockResolvedValue(mockStockDataApiResponse),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StockDataService)
      .useValue(mockStockDataService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();

    const dataSource = app.get(DataSource);
    stockPriceRepository = dataSource.getRepository(StockPrice);
    await stockPriceRepository.remove(await stockPriceRepository.find());

    stockPriceUpdateScheduleRepository = dataSource.getRepository(
      StockPriceUpdateSchedule,
    );
    await stockPriceUpdateScheduleRepository.remove(
      await stockPriceUpdateScheduleRepository.find(),
    );

    jest.clearAllMocks();
  });

  describe('Test fetching stock price', () => {
    it('/v1/stocks/:symbol (GET) - should load stock price from external service', async () => {
      // act
      const result = await request(app.getHttpServer())
        .get(`/v1/stocks/${mockStockDataApiResponse.symbol}`)
        .expect(200);

      // assert
      const stockDto: StockDto = {
        symbol: mockStockDataApiResponse.symbol,
        price: mockStockDataApiResponse.price,
        movingAverage: null,
        updatedAt: mockStockDataApiResponse.date.valueOf(),
      };
      expect(result.body).toMatchObject(stockDto);
    });

    it('/v1/stocks/:symbol (GET) - should load stock price from database', async () => {
      // arrange
      await stockPriceRepository.save(mockStockDataApiResponse);

      // act
      const result = await request(app.getHttpServer())
        .get(`/v1/stocks/${mockStockDataApiResponse.symbol}`)
        .expect(200);

      // assert
      const stockDto: StockDto = {
        symbol: mockStockDataApiResponse.symbol,
        price: mockStockDataApiResponse.price,
        movingAverage: null,
        updatedAt: mockStockDataApiResponse.date.valueOf(),
      };
      expect(result.body).toMatchObject(stockDto);
      expect(mockStockDataService.fetchQuoteForSymbol).not.toHaveBeenCalled();
    });

    it('/v1/stocks/:symbol (GET) - should return moving average after enough data', async () => {
      // arrange
      await stockPriceRepository.save([
        mockStockDataApiResponse,
        mockStockDataApiResponse,
        mockStockDataApiResponse,
        mockStockDataApiResponse,
        mockStockDataApiResponse,
        mockStockDataApiResponse,
      ]);

      // act
      const result = await request(app.getHttpServer())
        .get(`/v1/stocks/${mockStockDataApiResponse.symbol}`)
        .expect(200);

      // assert
      const stockDto: StockDto = {
        symbol: mockStockDataApiResponse.symbol,
        price: mockStockDataApiResponse.price,
        movingAverage: mockStockDataApiResponse.price,
        updatedAt: mockStockDataApiResponse.date.valueOf(),
      };
      expect(result.body).toMatchObject(stockDto);
      expect(mockStockDataService.fetchQuoteForSymbol).not.toHaveBeenCalled();
    });
  });

  describe('Test starting stock price update schedule', () => {
    it('/v1/stocks/:symbol (PUT) - should save schedule for symbol', async () => {
      // act
      await request(app.getHttpServer())
        .put(`/v1/stocks/${mockStockDataApiResponse.symbol}`)
        .expect(200);

      // assert
      const updateSchedule = await stockPriceUpdateScheduleRepository.findOne({
        where: { symbol: mockStockDataApiResponse.symbol },
      });
      expect(updateSchedule).toBeDefined();
    });
  });
});
