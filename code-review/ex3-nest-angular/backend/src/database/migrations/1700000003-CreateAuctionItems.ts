import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuctionItems1700000003 implements MigrationInterface {
  name = 'CreateAuctionItems1700000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."item_condition_enum" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."item_status_enum" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SOLD', 'ARCHIVED')
    `);

    await queryRunner.query(`
      CREATE TABLE "auction_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        "title" character varying(180) NOT NULL,
        "description" text NOT NULL,
        "condition" "public"."item_condition_enum" NOT NULL,
        "images" text[] NOT NULL DEFAULT '{}',
        "starting_price" numeric(14,2) NOT NULL,
        "reserve_price" numeric(14,2) NOT NULL,
        "buy_now_price" numeric(14,2),
        "seller_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "status" "public"."item_status_enum" NOT NULL DEFAULT 'DRAFT',
        "weight" numeric(8,3),
        "dimensions" jsonb,
        CONSTRAINT "PK_auction_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auction_items_seller_id" FOREIGN KEY ("seller_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_auction_items_category_id" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auction_items"`);
    await queryRunner.query(`DROP TYPE "public"."item_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."item_condition_enum"`);
  }
}
