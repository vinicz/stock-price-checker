import { Repository } from 'typeorm';
import { StockPrice } from './stock-price.entity';
import { MovingAverageCalculator } from './util/moving-average-calculator';
import { Test } from '@nestjs/testing';
import { StockPriceService } from './stock-price.service';
import { StockDataService } from 'src/services/stock-data/stock-data.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Stock price service', () => {
  let stockPriceRepository: Repository<StockPrice>;
  let movingAverageCalculator: MovingAverageCalculator;
  let stockDataService: StockDataService;
  let stockPriceService: StockPriceService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [
        {
          provide: getRepositoryToken(StockPrice),
          useValue: { findOne: jest.fn(), save: jest.fn(), find: jest.fn() },
        },
        MovingAverageCalculator,
        StockDataService,
        StockPriceService,
      ],
    }).compile();

    stockPriceRepository = moduleRef.get(getRepositoryToken(StockPrice));
    movingAverageCalculator = moduleRef.get(MovingAverageCalculator);
    stockDataService = moduleRef.get(StockDataService);
    stockPriceService = moduleRef.get(StockPriceService);
  });

  describe('Get stock price for symbol', () => {
    it('should fetch stock price from data service is there no saved prive', async () => {
      // arrange
      const symbol = 'AAPL';
      jest
        .spyOn(stockPriceRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));
      const currentPrice = { symbol: symbol, date: new Date(), price: 100 };
      jest
        .spyOn(stockDataService, 'fetchQuoteForSymbol')
        .mockImplementation(() => Promise.resolve(currentPrice));
      jest
        .spyOn(stockPriceRepository, 'find')
        .mockImplementation(() => Promise.resolve([]));
      const mockStockPriceRepositorySave = jest
        .spyOn(stockPriceRepository, 'save')
        .mockImplementation();

      // act
      const result = await stockPriceService.getStockPriceForSymbol(symbol);

      // assert
      expect(result).toEqual({ ...currentPrice, movingAverage: null });
      expect(mockStockPriceRepositorySave).toHaveBeenCalledWith(currentPrice);
    });
  });

  it('should not calculate average if there is no enough data yet', async () => {
    // arrange
    const symbol = 'AAPL';
    const stockPrice = { id: 10, symbol: symbol, date: new Date(), price: 100 };
    jest
      .spyOn(stockPriceRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(stockPrice));

    jest
      .spyOn(stockPriceRepository, 'find')
      .mockImplementation(() => Promise.resolve([stockPrice]));

    // act
    const result = await stockPriceService.getStockPriceForSymbol(symbol);

    // assert
    expect(result).toEqual({ ...stockPrice, movingAverage: null });
  });

  it('should calculate average if there is enough data', async () => {
    // arrange
    const symbol = 'AAPL';
    const stockPrice = { id: 10, symbol: symbol, date: new Date(), price: 100 };
    const movingAverage = 100;
    jest
      .spyOn(stockPriceRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(stockPrice));

    jest
      .spyOn(stockPriceRepository, 'find')
      .mockImplementation(() =>
        Promise.resolve([
          stockPrice,
          stockPrice,
          stockPrice,
          stockPrice,
          stockPrice,
          stockPrice,
        ]),
      );
    jest
      .spyOn(movingAverageCalculator, 'calculateMovingAverage')
      .mockImplementation(() => 100);

    // act
    const result = await stockPriceService.getStockPriceForSymbol(symbol);

    // assert
    expect(result).toEqual({ ...stockPrice, movingAverage: movingAverage });
  });

  describe('Save stock price ', () => {
    it('should save stock price', async () => {
      // arrange
      const stockPrice = { symbol: 'AAPL', date: new Date(), price: 100 };
      const mockStockPriceRepositorySave = jest
        .spyOn(stockPriceRepository, 'save')
        .mockImplementation();

      // act
      await stockPriceService.saveStockPrice(stockPrice);

      // assert
      expect(mockStockPriceRepositorySave).toHaveBeenCalledWith(stockPrice);
    });
  });
});
