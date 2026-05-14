-- Membership type intended when this invite is accepted (INTERNAL vs EXTERNAL).

ALTER TABLE "Invite" ADD COLUMN "membershipType" "MembershipType" NOT NULL DEFAULT 'INTERNAL';
