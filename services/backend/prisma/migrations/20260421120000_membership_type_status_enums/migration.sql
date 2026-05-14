-- No-op: membership enums and `Membership.type` / `Membership.status` changes are already
-- applied in `20260420080000_membership_type_and_status`. This folder duplicated that work
-- and broke `migrate dev` shadow replay (PostgreSQL: type "MembershipType" already exists).
SELECT 1;
