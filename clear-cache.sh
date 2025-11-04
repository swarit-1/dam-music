#!/bin/bash

echo "🧹 Clearing all caches..."

# Clear project caches
cd "$(dirname "$0")"
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro
rm -rf .expo-shared

# Clear Metro bundler cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*

# Clear npm cache
npm cache clean --force

# Clear watchman if installed
watchman watch-del-all 2>/dev/null || true

# Clear iOS build artifacts
rm -rf ios/build 2>/dev/null || true
rm -rf ios/Pods 2>/dev/null || true

# Clear Android build artifacts  
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
rm -rf android/.gradle 2>/dev/null || true

echo "✅ All caches cleared!"
echo ""
echo "💡 If you still have disk space issues, try:"
echo "   - Empty Trash"
echo "   - Clear Xcode Derived Data: rm -rf ~/Library/Developer/Xcode/DerivedData"
echo "   - Clear iOS Simulators: xcrun simctl delete unavailable"
echo "   - Clear Homebrew cache: brew cleanup"

