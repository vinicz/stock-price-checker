import { MigrationInterface, QueryRunner } from 'typeorm';

export class StockPriceEntity1739282666284 implements MigrationInterface {
  name = 'StockPriceEntity1739282666284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stock_price" ("id" SERIAL NOT NULL, "symbol" character varying NOT NULL, "price" real NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a363478dafdfed1814c9b0b97fd" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_price"`);
  }
}
