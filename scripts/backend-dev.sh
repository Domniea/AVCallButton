#!/usr/bin/env bash
# Start local SST (`stage local`) using credentials from `aws login --profile avcallbutton`.
# SST v2's AWS SDK does not understand aws-login profiles directly, so we export
# temporary env credentials and clear AWS_PROFILE before invoking sst.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${AWS_LOGIN_PROFILE:-avcallbutton}"

if ! aws sts get-caller-identity --profile "$PROFILE" >/dev/null 2>&1; then
  echo "AWS profile '$PROFILE' is missing or expired."
  echo "Run:  aws login --profile $PROFILE --region us-east-1"
  exit 1
fi

# Prefer static env creds; SST will prefer AWS_PROFILE if both are set.
unset AWS_PROFILE
eval "$(aws configure export-credentials --profile "$PROFILE" --format env)"
unset AWS_PROFILE

cd "$ROOT/services/backend"
exec yarn sst dev --stage local
