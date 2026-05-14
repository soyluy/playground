import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsAndWatchlist1700000008 implements MigrationInterface {
  name = 'CreateNotificationsAndWatchlist1700000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."notification_type_enum" AS ENUM (
        'BID_PLACED',
        'OUTBID',
        'AUCTION_WON',
        'AUCTION_ENDED',
        'AUCTION_STARTING',
        'PAYMENT_RECEIVED',
        'ITEM_APPROVED',
        'ITEM_REJECTED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "public"."notification_type_enum" NOT NULL,
        "title" character varying(180) NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "watchlists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "auction_id" uuid NOT NULL,
        "notify_on_bid" boolean NOT NULL DEFAULT true,
        "notify_on_ending_soon" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_watchlists_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_watchlists_user_auction" UNIQUE ("user_id", "auction_id"),
        CONSTRAINT "FK_watchlists_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_watchlists_auction_id" FOREIGN KEY ("auction_id")
          REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "watchlists"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
  }
}
