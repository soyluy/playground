import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutoBids1700000006 implements MigrationInterface {
  name = 'CreateAutoBids1700000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "auto_bids" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "auction_id" uuid NOT NULL,
        "bidder_id" uuid NOT NULL,
        "max_amount" numeric(14,2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_triggered_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auto_bids_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auto_bids_auction_id" FOREIGN KEY ("auction_id")
          REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_auto_bids_bidder_id" FOREIGN KEY ("bidder_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auto_bids"`);
  }
}
