#!/usr/bin/env bash
# Deprecated: local AWS access now uses permanent IAM keys on profile `avcallbutton`.
# Do not overwrite ~/.aws/credentials with temporary aws-login session tokens.
set -euo pipefail

PROFILE="${AWS_PROFILE_OVERRIDE:-avcallbutton}"

echo "refresh-aws-creds.sh is no longer needed."
echo "This project uses permanent IAM keys on profile '$PROFILE'."
echo
if aws sts get-caller-identity --profile "$PROFILE" >/dev/null 2>&1; then
  aws sts get-caller-identity --profile "$PROFILE" --query Arn --output text
  echo "OK — credentials are valid."
  exit 0
fi

echo "Profile '$PROFILE' is missing or invalid."
echo "Restore keys under [$PROFILE] in ~/.aws/credentials (AKIA…, no session token)."
exit 1
