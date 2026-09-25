UPDATE "submissionForms" SET "public_id" = gen_random_uuid() WHERE "public_id" IS NOT NULL OR true;

ALTER TABLE "submissionForms" ALTER COLUMN "public_id" SET DATA TYPE uuid USING "public_id"::uuid;--> statement-breakpoint
ALTER TABLE "submissionForms" ALTER COLUMN "public_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "submissionForms" ALTER COLUMN "public_id" DROP NOT NULL;