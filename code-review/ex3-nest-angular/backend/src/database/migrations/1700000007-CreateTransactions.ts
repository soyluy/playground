import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactions1700000007 implements MigrationInterface {
  name = 'CreateTransactions1700000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."transaction_type_enum" AS ENUM (
        'DEPOSIT',
        'WITHDRAWAL',
        'BID_HOLD',
        'BID_RELEASE',
        'PURCHASE',
        'REFUND',
        'FEE'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."transaction_status_enum" AS ENUM (
        'PENDING',
        'COMPLETED',
        'FAILED',
        'REVERSED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "public"."transaction_type_enum" NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "balance_before" numeric(14,2) NOT NULL,
        "balance_after" numeric(14,2) NOT NULL,
        "reference" character varying(120) NOT NULL,
        "description" text,
        "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
  }
}
