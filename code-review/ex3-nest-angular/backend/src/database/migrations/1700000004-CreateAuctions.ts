import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuctions1700000004 implements MigrationInterface {
  name = 'CreateAuctions1700000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."auction_type_enum" AS ENUM ('ENGLISH', 'DUTCH', 'RESERVE', 'BUY_NOW')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."auction_status_enum" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDING_SOON', 'ENDED', 'CANCELLED', 'FAILED')
    `);

    await queryRunner.query(`
      CREATE TABLE "auctions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        "item_id" uuid NOT NULL,
        "seller_id" uuid NOT NULL,
        "type" "public"."auction_type_enum" NOT NULL,
        "status" "public"."auction_status_enum" NOT NULL DEFAULT 'DRAFT',
        "start_time" TIMESTAMPTZ NOT NULL,
        "end_time" TIMESTAMPTZ NOT NULL,
        "starting_price" numeric(14,2) NOT NULL,
        "current_price" numeric(14,2) NOT NULL,
        "reserve_price" numeric(14,2),
        "buy_now_price" numeric(14,2),
        "bid_increment" numeric(14,2) NOT NULL DEFAULT 1,
        "extension_minutes" integer NOT NULL DEFAULT 2,
        "extension_threshold_seconds" integer NOT NULL DEFAULT 60,
        "winner_id" uuid,
        "final_price" numeric(14,2),
        "view_count" integer NOT NULL DEFAULT 0,
        "watcher_count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_auctions_id" PRIMARY KEY ("id"),
        CONSTRAINT "REL_auctions_item_id" UNIQUE ("item_id"),
        CONSTRAINT "FK_auctions_item_id" FOREIGN KEY ("item_id")
          REFERENCES "auction_items"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_auctions_seller_id" FOREIGN KEY ("seller_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auction_watchers" (
        "auction_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_auction_watchers" PRIMARY KEY ("auction_id", "user_id"),
        CONSTRAINT "FK_auction_watchers_auction_id" FOREIGN KEY ("auction_id")
          REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_auction_watchers_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auction_watchers"`);
    await queryRunner.query(`DROP TABLE "auctions"`);
    await queryRunner.query(`DROP TYPE "public"."auction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."auction_type_enum"`);
  }
}
