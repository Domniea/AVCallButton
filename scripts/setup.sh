#!/usr/bin/env bash
# Fresh-machine / returning-after-months setup for AV Call Button.
# Run from anywhere; it always operates from the repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== AV Call Button setup ==="
echo "Repo: $ROOT"
echo ""

if [[ ! -f "services/backend/.env" ]]; then
  echo "Missing services/backend/.env (needs DATABASE_URL and related secrets)."
  echo "Copy from a teammate or restore your local copy, then re-run:"
  echo "  yarn setup"
  exit 1
fi

if [[ ! -f "apps/web/.env" ]]; then
  echo "Warning: apps/web/.env is missing. Web will not know which API to call"
  echo "until NEXT_PUBLIC_API_URL (and related keys) are set."
  echo ""
fi

echo "1/3  Installing dependencies (yarn)…"
yarn install

echo ""
echo "2/3  Generating Prisma client…"
yarn prisma:generate

echo ""
echo "3/3  Optional database nuke"
echo "---------------------------------------------------------------------------"
echo "Nuke wipes the Postgres database (Neon) and recreates empty tables."
echo "It does NOT delete Cognito login accounts."
echo ""
echo "If you want a truly empty slate (new signups feeling brand new):"
echo "  1. Run the nuke below, AND"
echo "  2. Delete users in the AWS Cognito user pool console"
echo "     (pool id is in services/backend/stacks/ApiStack.ts)."
echo ""
echo "If you nuke but leave Cognito users alone, the next time those users"
echo "open the app they get a fresh personal workspace automatically."
echo "---------------------------------------------------------------------------"
echo ""

NUKE="n"
if [[ "${1:-}" == "--nuke" || "${1:-}" == "--yes-nuke" ]]; then
  NUKE="y"
else
  read -r -p "Run yarn db:nuke now? [y/N] " NUKE
fi

if [[ "$NUKE" =~ ^[Yy]$ ]]; then
  echo ""
  echo "Running db:nuke (you will be asked to type \"nuke\" unless --yes-nuke)…"
  if [[ "${1:-}" == "--yes-nuke" ]]; then
    yarn db:nuke -- --yes
  else
    yarn db:nuke
  fi
  echo ""
  echo "Remember: delete Cognito users separately if you want brand-new accounts."
else
  echo "Skipping nuke."
fi

echo ""
echo "=== Setup done ==="
echo ""
echo "Typical next steps (from repo root):"
echo "  yarn backend:dev     # local API (keep this terminal open)"
echo "  yarn web             # Next.js at localhost:3000"
echo "  yarn ios             # first-time / native rebuild"
echo "  yarn ios:start       # day-to-day if the app is already installed"
echo ""
echo "Point apps/web/.env NEXT_PUBLIC_API_URL at your local SST API URL,"
echo "or at the deployed (dev) API if you are not running backend:dev."
echo ""
echo "Full cheat sheet: README.md"
echo ""
