#!/usr/bin/env bash
set -euo pipefail

# Appflow native before-packaging hook
# Ensure web assets are copied into the native Android project before Gradle packages

echo "== Appflow before-package: copy web assets into android/ =="

# Remove stale native web assets if any (safety) then copy
if [ -d android/app/src/main/assets/public ]; then
  echo "(before-package) removing stale native web assets"
  rm -rf android/app/src/main/assets/public
fi

npx cap copy android

echo "== Sanity check: index.html location =="
if [ -f android/app/src/main/assets/public/index.html ]; then
  echo "Found: android/app/src/main/assets/public/index.html"
  ls -l android/app/src/main/assets/public/index.html
elif [ -f android/app/src/main/assets/www/index.html ]; then
  echo "Found: android/app/src/main/assets/www/index.html"
  ls -l android/app/src/main/assets/www/index.html
else
  echo "Warning: index.html not found in expected locations"
fi

echo "Appflow before-package finished"

# Optionally assemble a signed Release APK in CI if requested via env var
if [ "${APPFLOW_FORCE_RELEASE:-0}" = "1" ]; then
  echo "APPFLOW_FORCE_RELEASE=1 -> running Gradle assembleRelease to produce signed release APK"
  cd android
  if [ -f ./gradlew ]; then
    ./gradlew clean assembleRelease --no-daemon
  else
    gradle clean assembleRelease --no-daemon
  fi
  cd - >/dev/null || true
  echo "assembleRelease finished"
fi
