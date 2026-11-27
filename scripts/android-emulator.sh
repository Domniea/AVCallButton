#!/usr/bin/env bash
# Launch only the Pixel_10_API_36 emulator (no Metro).
set -euo pipefail

AVD_NAME="${ANDROID_AVD_NAME:-Pixel_10_API_36}"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"

export ANDROID_HOME ANDROID_SDK_ROOT JAVA_HOME
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

if [[ ! -x "$ANDROID_HOME/emulator/emulator" ]]; then
  echo "Android emulator not found at $ANDROID_HOME/emulator/emulator"
  exit 1
fi

if ! emulator -list-avds 2>/dev/null | grep -qx "$AVD_NAME"; then
  echo "AVD '$AVD_NAME' not found."
  emulator -list-avds
  exit 1
fi

adb start-server >/dev/null

if adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 ~ /^emulator-/' | grep -q .; then
  echo "Android emulator already running."
  adb devices -l
  exit 0
fi

echo "Starting AVD: $AVD_NAME"
exec emulator -avd "$AVD_NAME" -netdelay none -netspeed full
