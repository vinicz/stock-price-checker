import { StockPrice } from '../stock-price.entity';

interface DataBucket {
  start: Date;
  average: number | null;
}

export class MovingAverageCalculator {
  calculateMovingAverage(
    data: StockPrice[],
    windowStart: Date,
    windowEnd: Date,
    aggregationPeriodInMinutes: number,
  ) {
    const numberOfBuckets = Math.floor(
      (windowEnd.getTime() - windowStart.getTime()) /
        60000 /
        aggregationPeriodInMinutes,
    );

    const buckets: DataBucket[] = [];
    for (let i = 0; i < numberOfBuckets; i++) {
      const bucketStart = new Date(windowStart.getTime());
      bucketStart.setSeconds(0, 0);
      bucketStart.setTime(
        bucketStart.getTime() + i * 60 * 1000 * aggregationPeriodInMinutes,
      );
      const bucketEnd = new Date(
        bucketStart.getTime() + 60 * 1000 * aggregationPeriodInMinutes,
      );

      const pricesInBucket = data.filter((record) => {
        return record.date > bucketStart && record.date <= bucketEnd;
      });

      const averageInBucket =
        pricesInBucket.length > 0
          ? pricesInBucket.reduce((sum, record) => sum + record.price, 0) /
            pricesInBucket.length
          : null;

      buckets.push({
        start: bucketStart,
        average: averageInBucket,
      });
    }

    // Interpolate missing values
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].average === null) {
        // Find previous bucket with data
        let prevIndex = i - 1;
        while (prevIndex >= 0 && buckets[prevIndex].average === null) {
          prevIndex--;
        }
        // Find next bucket with data
        let nextIndex = i + 1;
        while (
          nextIndex < buckets.length &&
          buckets[nextIndex].average === null
        ) {
          nextIndex++;
        }

        if (prevIndex >= 0 && nextIndex < buckets.length) {
          // Lerp between previous and next bucket
          const prevValue = buckets[prevIndex].average!;
          const nextValue = buckets[nextIndex].average!;
          const factor = (i - prevIndex) / (nextIndex - prevIndex);
          buckets[i].average = prevValue + factor * (nextValue - prevValue);
        } else if (prevIndex >= 0) {
          buckets[i].average = buckets[prevIndex].average;
        } else if (nextIndex < buckets.length) {
          buckets[i].average = buckets[nextIndex].average;
        }
      }
    }

    return (
      buckets.reduce((sum, bucket) => sum + bucket.average!, 0) / buckets.length
    );
  }
}
