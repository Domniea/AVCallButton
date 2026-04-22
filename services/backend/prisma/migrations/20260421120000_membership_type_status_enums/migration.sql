-- Membership: enum-backed type and status (INTERNAL/EXTERNAL, ACTIVE/INACTIVE).

CREATE TYPE "MembershipType" AS ENUM ('INTERNAL', 'EXTERNAL');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "Membership"
ADD COLUMN "type" "MembershipType" NOT NULL DEFAULT 'INTERNAL';

ALTER TABLE "Membership"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Membership"
ALTER COLUMN "status" TYPE "MembershipStatus"
USING (
  CASE
    WHEN UPPER("status") = 'ACTIVE' THEN 'ACTIVE'::"MembershipStatus"
    ELSE 'INACTIVE'::"MembershipStatus"
  END
);

ALTER TABLE "Membership"
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
