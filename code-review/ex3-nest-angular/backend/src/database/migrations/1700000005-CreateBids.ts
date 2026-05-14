import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBids1700000005 implements MigrationInterface {
  name = 'CreateBids1700000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bids" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "auction_id" uuid NOT NULL,
        "bidder_id" uuid NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "is_auto_bid" boolean NOT NULL DEFAULT false,
        "max_auto_bid_amount" numeric(14,2),
        "is_winning" boolean NOT NULL DEFAULT false,
        "is_retracted" boolean NOT NULL DEFAULT false,
        "retracted_at" TIMESTAMPTZ,
        "ip_address" character varying(64) NOT NULL,
        "user_agent" character varying(512),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bids_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bids_auction_id" FOREIGN KEY ("auction_id")
          REFERENCES "auctions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_bids_bidder_id" FOREIGN KEY ("bidder_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bids"`);
  }
}
