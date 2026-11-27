#!/usr/bin/env bash
# Boot the Pixel_10_API_36 emulator, then start the Expo mobile app on Android.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AVD_NAME="${ANDROID_AVD_NAME:-Pixel_10_API_36}"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"

export ANDROID_HOME ANDROID_SDK_ROOT JAVA_HOME
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

if [[ ! -x "$ANDROID_HOME/emulator/emulator" ]]; then
  echo "Android emulator not found at $ANDROID_HOME/emulator/emulator"
  echo "Install Android Studio / SDK first, then retry."
  exit 1
fi

if ! emulator -list-avds 2>/dev/null | grep -qx "$AVD_NAME"; then
  echo "AVD '$AVD_NAME' not found."
  echo "Available AVDs:"
  emulator -list-avds
  exit 1
fi

adb start-server >/dev/null

emulator_already_up() {
  adb devices 2>/dev/null | awk 'NR>1 && $2=="device" && $1 ~ /^emulator-/' | grep -q .
}

boot_completed() {
  local serial="$1"
  [[ "$(adb -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]
}

wait_for_emulator() {
  local serial=""
  local i

  echo "Waiting for $AVD_NAME to come online..."
  for i in $(seq 1 90); do
    serial="$(adb devices 2>/dev/null | awk 'NR>1 && $1 ~ /^emulator-/ {print $1; exit}')"
    if [[ -n "$serial" ]] && boot_completed "$serial"; then
      echo "Emulator ready: $serial"
      adb -s "$serial" devices -l | awk 'NR==2'
      return 0
    fi
    sleep 2
  done

  echo "Timed out waiting for emulator '$AVD_NAME' to finish booting."
  adb devices -l || true
  exit 1
}

if emulator_already_up; then
  echo "Android emulator already running."
else
  echo "Starting AVD: $AVD_NAME"
  # Launch detached so Expo keeps the foreground in this terminal.
  nohup emulator -avd "$AVD_NAME" -netdelay none -netspeed full \
    >/tmp/avcallbutton-android-emulator.log 2>&1 &
  disown || true
fi

wait_for_emulator

cd "$ROOT/apps/mobile"
# Pass through extra flags (e.g. --clear) to Expo.
exec yarn expo start --dev-client --android "$@"
