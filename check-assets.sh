#!/bin/bash
# Run this from your project root (vendor_app 2 dir).
# Checks every require('...') path in src/constants/images.ts
# against the actual filesystem and reports any missing files.

FILE="src/constants/images.ts"

if [ ! -f "$FILE" ]; then
  echo "Can't find $FILE — run this script from your project root."
  exit 1
fi

echo "Checking asset paths referenced in $FILE ..."
echo ""

missing=0
total=0

grep -oE "require\('[^']+'\)" "$FILE" | sed -E "s/require\('(.+)'\)/\1/" | while read -r relpath; do
  total=$((total+1))
  # paths are relative to src/constants/, so resolve from there
  resolved="src/constants/$relpath"
  if [ ! -f "$resolved" ]; then
    echo "MISSING: $relpath"
    missing=$((missing+1))
  fi
done

echo ""
echo "Done. Any 'MISSING:' lines above need fixing (rename in images.ts to match the real filename, or add the missing asset file)."