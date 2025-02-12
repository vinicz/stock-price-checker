import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { StockPriceDto } from 'src/domain/stock-price/stock-price.dto';
import { StockQuoteDto } from './stock-quote.dto';

const STOCK_URL_TEMPLATE = (token: string, symbol: string) =>
  `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`;
// At the moment only works for the US market
const MARKET_STATUS_URL_TEMPLATE = (token: string) =>
  `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${token}`;

@Injectable()
export class StockDataService {
  private readonly logger = new Logger(StockDataService.name);
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async checkIfMarketIsOpen(): Promise<boolean> {
    const finnHubToken = this.getApiToken();

    const { data } = await firstValueFrom(
      this.httpService
        .get<{
          isOpen: boolean;
        }>(MARKET_STATUS_URL_TEMPLATE(finnHubToken))
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new InternalServerErrorException();
          }),
        ),
    );

    return data.isOpen;
  }

  async fetchQuoteForSymbol(symbol: string): Promise<StockPriceDto> {
    const finnHubToken = this.getApiToken();

    const { data } = await firstValueFrom(
      this.httpService
        .get<StockQuoteDto>(STOCK_URL_TEMPLATE(finnHubToken, symbol))
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new InternalServerErrorException();
          }),
        ),
    );

    // The API still returns a 200 status code even if the symbol is invalid, but
    // with and empty DTO  where the timestamp is 0
    if (data.t === 0) {
      throw new NotFoundException(`No stock found for symbol ${symbol}`);
    }

    return {
      symbol: symbol,
      price: data.c,
      date: new Date(data.t * 1000),
    };
  }

  private getApiToken(): string {
    const token = this.configService.get<string>('FINNHUB_TOKEN');

    if (!token) {
      throw new InternalServerErrorException('FINNHUB_TOKEN is not defined');
    }

    return token;
  }
}
