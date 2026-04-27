-- Drop any GOOGLE_CALENDAR rows before narrowing the enum.
DELETE FROM "Integration" WHERE "provider" = 'GOOGLE_CALENDAR';

-- Postgres can't drop a value from an enum in place, so we rebuild the type.
CREATE TYPE "IntegrationProvider_new" AS ENUM ('GITHUB', 'LEETCODE');
ALTER TABLE "Integration"
  ALTER COLUMN "provider" TYPE "IntegrationProvider_new"
  USING ("provider"::text::"IntegrationProvider_new");
DROP TYPE "IntegrationProvider";
ALTER TYPE "IntegrationProvider_new" RENAME TO "IntegrationProvider";
