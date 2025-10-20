# DAM Music - Profile Section

## 📱 Profile Feature Overview

The Profile section allows users to:

-   **Upload song samples** to showcase their music
-   **Manage their music library** with a visual song list
-   **Manage connections** (followers/following)
-   View profile statistics

## 🏗️ Project Structure

```
dam-music/
├── screens/
│   ├── HomeScreen.tsx          # Home/feed screen
│   ├── SearchScreen.tsx        # Search functionality
│   └── ProfileScreen.tsx       # Main profile screen
├── components/
│   └── Profile/
│       ├── SongUploader.tsx    # Upload music samples
│       ├── SongList.tsx        # Display uploaded songs
│       └── ConnectionsManager.tsx # Manage user connections
├── types/
│   └── profile.ts              # TypeScript interfaces
└── App.tsx                     # Main app with navigation
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Run the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📋 Profile Components

### 1. **ProfileScreen** (`screens/ProfileScreen.tsx`)

The main profile screen that combines all profile features:

-   Profile header with avatar, bio, and stats
-   Song uploader component
-   Song list with playback
-   Connections manager

### 2. **SongUploader** (`components/Profile/SongUploader.tsx`)

Handles music file uploads:

-   File picker for audio files (MP3, WAV, M4A)
-   Upload progress indication
-   Success/error handling

**Props:**

-   `onUploadComplete?: (songData: any) => void` - Callback when upload completes

### 3. **SongList** (`components/Profile/SongList.tsx`)

Displays uploaded songs:

-   Song thumbnail/cover art
-   Title, artist, and duration
-   Delete functionality
-   Empty state when no songs

**Props:**

-   `songs: Song[]` - Array of song objects
-   `onSongPress?: (song: Song) => void` - Play song callback
-   `onDeleteSong?: (songId: string) => void` - Delete song callback

### 4. **ConnectionsManager** (`components/Profile/ConnectionsManager.tsx`)

Manages user connections:

-   Search connections
-   Filter by: All, Followers, Following
-   Display mutual connections
-   Remove connections

**Props:**

-   `connections: Connection[]` - Array of connection objects
-   `onRemoveConnection?: (connectionId: string) => void` - Remove callback
-   `onAddConnection?: (username: string) => void` - Add new connection

## 🔧 TypeScript Types

Located in `types/profile.ts`:

```typescript
interface Song {
    id: string;
    title: string;
    artist: string;
    duration: number;
    audioUrl: string;
    uploadedAt: Date;
    coverImage?: string;
}

interface Connection {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    connectionType: "following" | "follower" | "mutual";
    connectedAt: Date;
}

interface Profile {
    id: string;
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    songs: Song[];
    connections: Connection[];
    followersCount: number;
    followingCount: number;
}
```

## 🎨 Navigation

The app uses React Navigation with bottom tabs:

-   **Home Tab** (🏠) - Main feed
-   **Search Tab** (🔍) - Search functionality
-   **Profile Tab** (👤) - User profile

## 📦 Dependencies

-   `expo` - React Native framework
-   `expo-av` - Audio/video playback
-   `expo-document-picker` - File selection
-   `@react-navigation/native` - Navigation
-   `@react-navigation/bottom-tabs` - Tab navigation
-   `react-native-screens` - Native navigation
-   `react-native-safe-area-context` - Safe area handling

## 🔜 TODO: Backend Integration

Current implementation uses mock data. To connect to a backend:

1. **Create an API service** (`services/api.ts`):

```typescript
// Example API functions to implement
export const uploadSong = async (file: File) => { ... }
export const getSongs = async (userId: string) => { ... }
export const deleteSong = async (songId: string) => { ... }
export const getConnections = async (userId: string) => { ... }
export const removeConnection = async (connectionId: string) => { ... }
```

2. **Add state management** (Redux, MobX, or Context API)

3. **Implement authentication** to get current user

4. **Add real audio playback** using `expo-av`

## 🎵 Next Steps

-   [ ] Connect to backend API
-   [ ] Implement actual audio playback
-   [ ] Add audio waveform visualization
-   [ ] Implement profile editing
-   [ ] Add image upload for avatars/covers
-   [ ] Implement real-time connection updates
-   [ ] Add pull-to-refresh functionality
-   [ ] Implement pagination for large lists

## 📝 Notes

-   The current implementation uses mock data for demonstration
-   File uploads are simulated with timeouts
-   Replace TODO comments with actual backend integration
-   Consider adding loading states and error boundaries
