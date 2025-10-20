# dam-music

A React Native music player application built with Expo.

## Project Overview

**dam-music** is a cross-platform mobile music application built with React Native and Expo. The app is designed to handle audio playback and music management across iOS, Android, and Web platforms.

### Tech Stack
- **Framework**: Expo SDK 54
- **UI**: React Native 0.81.4
- **Language**: TypeScript 5.9.2
- **Audio**: expo-av (for audio/video playback)
- **React**: 19.1.0

### Platform Support
- iOS (including tablet support)
- Android (edge-to-edge display)
- Web

## Key Files and Directories

### Root Files
- [App.tsx](App.tsx) - Root React component, main entry point for the UI
- [index.ts](index.ts) - Application entry point, registers the root component
- [app.json](app.json) - Expo configuration (app name, icons, splash screens, platform settings)
- [package.json](package.json) - Dependencies and npm scripts
- [tsconfig.json](tsconfig.json) - TypeScript configuration (extends Expo defaults)

### Directories
- [assets/](assets/) - App icons, splash screens, and other static assets
  - `icon.png` - App icon (1024x1024)
  - `adaptive-icon.png` - Android adaptive icon
  - `splash-icon.png` - Splash screen icon
  - `favicon.png` - Web favicon

## Development Notes

### Current Status
The project is in early development stage with boilerplate code in place. The expo-av library is installed but not yet integrated for audio playback functionality.

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

### Architecture Decisions
- Using Expo for cross-platform development to simplify build process and deployments
- TypeScript with strict mode for type safety
- expo-av chosen for audio playback capabilities

### Next Steps / TODO
- Implement audio playback functionality using expo-av
- Design and build music player UI
- Add music library management
- Implement playlist functionality
- Add music file import/selection features
