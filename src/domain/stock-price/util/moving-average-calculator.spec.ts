import { MovingAverageCalculator } from './moving-average-calculator';
import { StockPriceDto } from '../stock-price.dto';

describe('MovingAverageCalculator', () => {
  let calculator: MovingAverageCalculator;
  beforeEach(() => {
    calculator = new MovingAverageCalculator();
  });

  // Helper to create a StockPrice record
  const createStockPrice = (date: Date, price: number): StockPriceDto => {
    return { date, price, symbol: 'AAPL' };
  };

  it('should calculate correctly with a single bucket', () => {
    const windowStart = new Date('2023-01-01T10:00:00.000Z');
    // Set windowEnd such that only one bucket is created (e.g. 1 minute difference)
    const windowEnd = new Date('2023-01-01T10:01:00.000Z');
    const data: StockPriceDto[] = [
      createStockPrice(new Date('2023-01-01T10:00:30.000Z'), 15),
    ];
    // Only one bucket exists so average = 15.
    const expected = 15;
    const result = calculator.calculateMovingAverage(
      data,
      windowStart,
      windowEnd,
      1,
    );
    expect(result).toBe(expected);
  });

  it('should calculate correctly with the same price repeated at the last time', () => {
    const windowStart = new Date('2023-01-01T10:00:11.000Z');
    const windowEnd = new Date('2023-01-01T10:10:11.000Z');
    const data: StockPriceDto[] = [
      createStockPrice(new Date('2023-01-01T10:10:11.000Z'), 15),
      createStockPrice(new Date('2023-01-01T10:10:11.000Z'), 15),
      createStockPrice(new Date('2023-01-01T10:10:11.000Z'), 15),
      createStockPrice(new Date('2023-01-01T10:10:11.000Z'), 15),
      createStockPrice(new Date('2023-01-01T10:10:11.000Z'), 15),
      createStockPrice(new Date('2023-01-01T10:10:11.000Z'), 15),
    ];

    const expected = 15;
    const result = calculator.calculateMovingAverage(
      data,
      windowStart,
      windowEnd,
      1,
    );
    expect(result).toBe(expected);
  });

  it('should calculate moving average correctly when all buckets have data', () => {
    const windowStart = new Date('2023-01-01T10:00:00.000Z');
    const windowEnd = new Date('2023-01-01T10:03:00.000Z'); // 3 minutes window, 3 buckets
    // Bucket timings:
    // Bucket 0: >10:00:00 - <=10:01:00
    // Bucket 1: >10:01:00 - <=10:02:00
    // Bucket 2: >10:02:00 - <=10:03:00
    const data: StockPriceDto[] = [
      createStockPrice(new Date('2023-01-01T10:00:30.000Z'), 10),
      createStockPrice(new Date('2023-01-01T10:01:30.000Z'), 20),
      createStockPrice(new Date('2023-01-01T10:02:30.000Z'), 30),
    ];

    // Each bucket average equals the only price in it.
    const expected = (10 + 20 + 30) / 3;
    const result = calculator.calculateMovingAverage(
      data,
      windowStart,
      windowEnd,
      1,
    );
    expect(result).toBe(expected);
  });

  it('should interpolate missing bucket averages when a bucket has no data', () => {
    const windowStart = new Date('2023-01-01T10:00:00.000Z');
    const windowEnd = new Date('2023-01-01T10:03:00.000Z'); // 3 buckets
    // Create data only for bucket0 and bucket2.
    const data: StockPriceDto[] = [
      createStockPrice(new Date('2023-01-01T10:00:30.000Z'), 10),
      createStockPrice(new Date('2023-01-01T10:02:30.000Z'), 30),
    ];
    // Expected:
    // Bucket 0: average = 10
    // Bucket 1: interpolated = 10 + 0.5*(30-10)=20
    // Bucket 2: average = 30
    const expected = (10 + 20 + 30) / 3;
    const result = calculator.calculateMovingAverage(
      data,
      windowStart,
      windowEnd,
      1,
    );
    expect(result).toBe(expected);
  });

  it('should handle missing data in the first bucket by copying the next bucket average', () => {
    const windowStart = new Date('2023-01-01T10:00:00.000Z');
    const windowEnd = new Date('2023-01-01T10:03:00.000Z'); // 3 buckets
    // Create data for bucket1 and bucket2 only (bucket0 missing).
    const data: StockPriceDto[] = [
      createStockPrice(new Date('2023-01-01T10:01:30.000Z'), 20),
      createStockPrice(new Date('2023-01-01T10:02:30.000Z'), 30),
    ];
    // Expected:
    // Bucket 0: no data, so copy from bucket1 = 20
    // Bucket 1: average = 20
    // Bucket 2: average = 30
    const expected = (20 + 20 + 30) / 3;
    const result = calculator.calculateMovingAverage(
      data,
      windowStart,
      windowEnd,
      1,
    );
    expect(result).toBe(expected);
  });

  it('should average the values if they are getting into the same bucket', () => {
    const windowStart = new Date('2023-01-01T10:00:00.000Z');
    const windowEnd = new Date('2023-01-01T10:03:00.000Z'); // 3 minutes window, 3 buckets
    // Bucket timings:
    // Bucket 0: >10:00:00 - <=10:01:00
    // Bucket 1: >10:01:00 - <=10:02:00
    // Bucket 2: >10:02:00 - <=10:03:00
    const data: StockPriceDto[] = [
      createStockPrice(new Date('2023-01-01T10:00:30.000Z'), 10),
      createStockPrice(new Date('2023-01-01T10:01:30.000Z'), 20),
      createStockPrice(new Date('2023-01-01T10:01:45.000Z'), 25),
      createStockPrice(new Date('2023-01-01T10:02:30.000Z'), 30),
    ];

    // Each bucket average equals the only price in it.
    const expected = (10 + (20 + 25) / 2 + 30) / 3;
    const result = calculator.calculateMovingAverage(
      data,
      windowStart,
      windowEnd,
      1,
    );
    expect(result).toBe(expected);
  });
});
