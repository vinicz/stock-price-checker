import { MigrationInterface, QueryRunner } from 'typeorm';

export class StockPriceUpdateScheduleEntity1739297683833
  implements MigrationInterface
{
  name = 'StockPriceUpdateScheduleEntity1739297683833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stock_price_update_schedule" ("id" SERIAL NOT NULL, "symbol" character varying NOT NULL, "lastStartedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9ce3aa28d09b0cc46e0312042b1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_price_update_schedule"`);
  }
}
