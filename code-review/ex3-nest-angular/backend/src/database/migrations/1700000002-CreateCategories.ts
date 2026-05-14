import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategories1700000002 implements MigrationInterface {
  name = 'CreateCategories1700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        "name" character varying(120) NOT NULL,
        "slug" character varying(140) NOT NULL,
        "description" text,
        "parent_category_id" uuid,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_categories_parent_category_id" FOREIGN KEY ("parent_category_id")
          REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
