import { Test } from '@nestjs/testing';
import { StockPriceUpdateScheduleService } from './stock-price-update-schedule.service';
import { StockDataService } from 'src/services/stock-data/stock-data.service';
import { StockPriceService } from '../stock-price/stock-price.service';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StockPriceUpdateSchedule } from './stock-price-update-schedule.entity';

describe('Test price update scheduling', () => {
  let service: StockPriceUpdateScheduleService;
  let stockDataService: StockDataService;
  let stockPriceService: StockPriceService;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StockPriceUpdateScheduleService,
        {
          provide: StockDataService,
          useValue: {
            checkIfMarketIsOpen: jest.fn(),
            fetchQuoteForSymbol: jest.fn(),
          },
        },
        {
          provide: StockPriceService,
          useValue: {
            saveStockPrice: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(StockPriceUpdateSchedule),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(StockPriceUpdateScheduleService);
    stockDataService = moduleRef.get(StockDataService);
    stockPriceService = moduleRef.get(StockPriceService);

    // Reset all mocks before each test.
    jest.clearAllMocks();
  });

  describe('Test stock price update process', () => {
    it('should log market closed when market is closed', async () => {
      // arrange
      const mockChekMarketIsOpen = jest
        .spyOn(stockDataService, 'checkIfMarketIsOpen')
        .mockResolvedValue(false);

      // act
      await service.updateStockProcess();

      // assert
      expect(mockChekMarketIsOpen).toHaveBeenCalled();
      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should update stock process when there is a stock to update', async () => {
      // arrange
      const mockChekMarketIsOpen = jest
        .spyOn(stockDataService, 'checkIfMarketIsOpen')
        .mockResolvedValue(true);
      const stockToUpdate = { symbol: 'AAPL', lastStartedAt: new Date(0) };
      mockRepository.findOne
        .mockResolvedValueOnce(stockToUpdate)
        .mockResolvedValueOnce(null);

      const updatedSchedule = { ...stockToUpdate, lastStartedAt: new Date() };
      mockRepository.save.mockResolvedValue(updatedSchedule);

      const currentStockPrice = {
        symbol: 'AAPL',
        price: 150,
        date: new Date(),
      };
      const mockFetchQuoteForSymbol = jest
        .spyOn(stockDataService, 'fetchQuoteForSymbol')
        .mockResolvedValue(currentStockPrice);
      const mockStockPriceService = jest.spyOn(
        stockPriceService,
        'saveStockPrice',
      );

      // act
      await service.updateStockProcess();

      // assert
      expect(mockChekMarketIsOpen).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(2);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...stockToUpdate,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lastStartedAt: expect.any(Date),
      });
      expect(mockFetchQuoteForSymbol).toHaveBeenCalledWith(
        stockToUpdate.symbol,
      );
      expect(mockStockPriceService).toHaveBeenCalledWith(currentStockPrice);
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      // arrange
      jest
        .spyOn(stockDataService, 'checkIfMarketIsOpen')
        .mockResolvedValue(true);
      mockRepository.findOne.mockRejectedValueOnce(new Error('Test error'));

      // act
      await service.updateStockProcess();

      // assert
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('Test stock price update schedule setup', () => {
    const stockPriceSchedule: StockPriceUpdateSchedule = {
      id: 1,
      symbol: 'AAPL',
      lastStartedAt: new Date(),
    };

    it('should not save schedule if symbol does not exist', async () => {
      // arrange
      mockRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(stockDataService, 'fetchQuoteForSymbol')
        .mockRejectedValue(new Error('Symbol not found'));

      // act assert
      await expect(
        service.scheduleStockPriceUpdate(stockPriceSchedule.symbol),
      ).rejects.toThrow('Symbol not found');
    });

    it('should not save schedule if its already saved', async () => {
      // arrange
      const mockFetchQuoteForSymbol = jest.spyOn(
        stockDataService,
        'fetchQuoteForSymbol',
      );
      mockRepository.findOne.mockResolvedValue(stockPriceSchedule);

      // act
      await service.scheduleStockPriceUpdate(stockPriceSchedule.symbol);

      // act assert
      expect(mockFetchQuoteForSymbol).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should save schedule if symbol exists', async () => {
      // arrange
      mockRepository.findOne.mockResolvedValue(null);
      const mockFetchQuoteForSymbol = jest
        .spyOn(stockDataService, 'fetchQuoteForSymbol')
        .mockResolvedValue({
          symbol: stockPriceSchedule.symbol,
          price: 150,
          date: new Date(),
        });

      // act
      await service.scheduleStockPriceUpdate(stockPriceSchedule.symbol);

      // assert
      expect(mockFetchQuoteForSymbol).toHaveBeenCalledWith(
        stockPriceSchedule.symbol,
      );
      expect(mockRepository.save).toHaveBeenCalledWith({
        symbol: stockPriceSchedule.symbol,
      });
    });
  });
});
