import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1700000009 implements MigrationInterface {
  name = 'AddIndexes1700000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_auctions_search_status_start_price"
      ON "auctions" ("status", "start_time", "current_price")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_auctions_seller_status_end_time"
      ON "auctions" ("seller_id", "status", "end_time")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_auctions_active_partial"
      ON "auctions" ("end_time", "current_price")
      WHERE "status" = 'ACTIVE'
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bids_auction_amount_created"
      ON "bids" ("auction_id", "amount", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_bids_bidder_created"
      ON "bids" ("bidder_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_user_created_status"
      ON "transactions" ("user_id", "created_at", "status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_reference"
      ON "transactions" ("reference")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_unread"
      ON "notifications" ("user_id", "created_at")
      WHERE "is_read" = false AND "created_at" > NOW() - INTERVAL '30 days'
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_watchlists_auction_notify_end"
      ON "watchlists" ("auction_id", "notify_on_ending_soon")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_watchlists_auction_notify_end"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_user_unread"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_transactions_reference"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_transactions_user_created_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bids_bidder_created"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bids_auction_amount_created"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_auctions_active_partial"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_auctions_seller_status_end_time"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_auctions_search_status_start_price"`);
  }
}
