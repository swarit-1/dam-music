# dam-music

A React Native music player application built with Expo.

## Project Overview

**dam-music** is a cross-platform mobile music application built with React Native and Expo. The app matches music creators (producers, vocalists, guitarists, etc.) through an infinite-scroll feed of short audio clips, ranked by compatibility based on genre, skills, role complement, and location.

### MVP Features
- **Infinite Scroll Feed**: TikTok/Instagram Reels-style vertical feed of audio clips
- **Smart Matching**: Algorithm ranks posts by compatibility with user profile (genre, skills, roles needed)
- **Audio Playback**: Short looping audio snippets using expo-av
- **Creator Profiles**: Swipe right to view full creator profile
- **Match Scoring**: Weighted algorithm combining genre match (50%), role compatibility (30%), and skill overlap (20%)

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
- [src/](src/) - Source code directory
  - [src/screens/](src/screens/) - Screen components
    - [FeedScreen.tsx](src/screens/FeedScreen.tsx) - Main infinite scroll feed
  - [src/services/](src/services/) - Business logic and services
    - [matchingService.ts](src/services/matchingService.ts) - Match scoring algorithm
    - [audioService.ts](src/services/audioService.ts) - Audio playback management
  - [src/types/](src/types/) - TypeScript type definitions
    - [index.ts](src/types/index.ts) - User and Post models
  - [src/data/](src/data/) - Mock data and constants
    - [mockData.ts](src/data/mockData.ts) - Sample users and posts
  - [src/navigation/](src/navigation/) - Navigation configuration
    - [AppNavigator.tsx](src/navigation/AppNavigator.tsx) - Bottom tab navigation

## Development Notes

### Current Status
MVP implementation complete with:
- Infinite scroll feed with TikTok-style vertical swiping
- Smart matching algorithm that ranks posts by compatibility
- Audio playback with play/pause controls
- Match percentage display for each post
- Mock data for testing (8 sample posts with various genres and roles)

The app is ready for testing with `npm start`.

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

### Architecture Decisions
- Using Expo for cross-platform development to simplify build process and deployments
- TypeScript with strict mode for type safety
- expo-av chosen for audio playback capabilities

### Data Models

**User Model**:
```typescript
{
  id: string;
  role: string[]; // e.g., ["producer", "vocalist"]
  skills: string[]; // e.g., ["mixing", "songwriting"]
  genres: string[]; // e.g., ["pop", "lofi", "rnb"]
  location: string; // e.g., "Austin, TX"
}
```

**Post Model**:
```typescript
{
  id: string;
  creator_id: string;
  audio_clip_url: string;
  genre: string;
  tags: string[];
  roles_needed: string[]; // e.g., ["vocalist", "guitarist"]
}
```

### Matching Algorithm
Score calculation combines:
- **50%** Genre match (exact match in user's genres)
- **30%** Role compatibility (user's role matches roles_needed)
- **20%** Skill overlap (intersection of user skills and post tags)

Posts are sorted by score + recency for the feed.
