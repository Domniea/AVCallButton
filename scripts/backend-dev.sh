#!/usr/bin/env bash
# Start local SST (`stage local`) using the long-lived `avcallbutton` IAM profile.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${AWS_PROFILE_OVERRIDE:-avcallbutton}"

if ! aws sts get-caller-identity --profile "$PROFILE" >/dev/null 2>&1; then
  echo "AWS profile '$PROFILE' is missing or invalid."
  echo "Expected permanent IAM keys in ~/.aws/credentials under [$PROFILE]."
  exit 1
fi

export AWS_PROFILE="$PROFILE"
# Clear any leftover session env vars so SST uses the profile keys.
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_SECURITY_TOKEN

cd "$ROOT/services/backend"
exec yarn sst dev --stage local
