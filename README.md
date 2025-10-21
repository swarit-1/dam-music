# dam-music

A music creator matching app that connects producers, vocalists, and musicians through an infinite-scroll feed of audio clips.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run the App
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## What's This App?

dam-music matches music creators through a TikTok-style vertical feed of short audio clips. Each post is ranked by compatibility based on:
- **Genre match** (50%)
- **Role compatibility** (30%)
- **Skill overlap** (20%)

### Features
- Infinite scroll feed with auto-playing audio
- Smart matching algorithm
- Match percentage display
- Full creator profiles on each post
- Play/pause controls

## Project Structure

```
src/
├── screens/
│   └── FeedScreen.tsx          # Main feed
├── services/
│   ├── matchingService.ts      # Scoring algorithm
│   └── audioService.ts         # Audio playback
├── types/
│   └── index.ts                # Data models
├── data/
│   └── mockData.ts             # Sample data
└── navigation/
    └── AppNavigator.tsx        # Navigation
```

## How It Works

### The Matching Algorithm

The app calculates a match score for each post based on the current user's profile:

```typescript
score = (0.5 × genre_match) + (0.3 × role_match) + (0.2 × skill_overlap)
```

Posts are then sorted by score and recency.

### Example User Profile

```typescript
{
  role: ["producer", "mixing engineer"],
  skills: ["mixing", "mastering", "beat-making"],
  genres: ["lofi", "rnb", "electronic"],
  location: "Austin, TX"
}
```

### Example Post

```typescript
{
  creator: "Sarah Chen",
  genre: "lofi",
  roles_needed: ["producer", "mixing engineer"],
  tags: ["chill", "vocal", "songwriting"],
  audio_clip_url: "..."
}
```

This would be a high match (85%+) because:
- Genre matches (lofi)
- Role matches (producer + mixing engineer)
- Related skills/tags

## Tech Stack

- **React Native** 0.81.4
- **Expo** SDK 54
- **TypeScript** 5.9.2
- **expo-av** for audio playback
- **React Navigation** for tab navigation

## Documentation

- [claude.md](claude.md) - Full project documentation
- [MVP_IMPLEMENTATION.md](MVP_IMPLEMENTATION.md) - Implementation details

## Next Steps

See [MVP_IMPLEMENTATION.md](MVP_IMPLEMENTATION.md) for:
- Backend integration guide
- Feature roadmap
- Production considerations
- Testing instructions

## Current Status

MVP is complete and ready for testing. The app uses mock data but the full matching algorithm and UI are functional.
