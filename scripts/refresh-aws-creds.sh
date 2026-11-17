#!/usr/bin/env bash
# Bridge `aws login` session credentials into ~/.aws/credentials for SST.
# SST v2 does not read the aws-login cache directly.
set -euo pipefail

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "No active AWS session. Run: aws login"
  exit 1
fi

python3 - <<'PY'
import json, subprocess, pathlib
raw = subprocess.check_output(["aws", "configure", "export-credentials"], text=True)
data = json.loads(raw)
path = pathlib.Path.home() / ".aws" / "credentials"
path.write_text(
    "[default]\n"
    f"aws_access_key_id = {data['AccessKeyId']}\n"
    f"aws_secret_access_key = {data['SecretAccessKey']}\n"
    f"aws_session_token = {data['SessionToken']}\n"
)
path.chmod(0o600)
exp = data.get("Expiration") or data.get("expiry") or "unknown"
print(f"Updated ~/.aws/credentials (session). Expires: {exp}")
PY

aws sts get-caller-identity --query Arn --output text
