# DAM Music - Music Creator Collaboration Platform

A React Native mobile application that connects music creators through an intelligent matching system, featuring an immersive TikTok-style feed, real-time collaboration tools, and comprehensive project management.

## 🎵 Overview

DAM Music is a social platform designed to help music creators find their perfect collaborators. Whether you're a producer, vocalist, songwriter, or musician, the app uses a smart matching algorithm to connect you with creators whose skills, genres, and creative styles complement yours.

## ✨ Key Features

### 🎯 Smart Feed & Matching
- **Infinite Scroll Feed**: TikTok-style vertical feed with auto-playing audio and video content
- **AI-Powered Matching**: Intelligent algorithm that scores compatibility based on:
  - Genre match (50%)
  - Role compatibility (30%)
  - Skill overlap (20%)
- **Real-time Match Scores**: Visual percentage indicators showing collaboration potential
- **Video & Audio Content**: Support for both audio waveform visualizations and video posts

### 👤 Creator Profiles
- **Detailed Creator Pages**: View full profiles with bio, roles, skills, and past work
- **Portfolio Showcase**: Display songs, videos, and creative content
- **Connection Management**: Build your network of collaborators
- **Custom Profile Customization**: Personalize your creative identity

### 💬 Messaging & Communication
- **Direct Messaging**: One-on-one chat with other creators
- **Project Collaboration Chats**: Dedicated spaces for active projects
- **Rich Media Support**: Share audio, video, and file attachments
- **Typing Indicators & Read Receipts**: Real-time communication feedback
- **Voice Notes**: Quick audio messages for creative feedback

### 📋 Project Management
- **Kanban Boards**: Visual task management for each collaboration
- **Multi-User Boards**: Separate boards for each collaborator
- **Task Assignment**: Assign tasks to specific team members
- **Priority Levels**: Urgent, high, medium, and low priority tasks
- **Progress Tracking**: Monitor completion status and updates

### 📸 Content Creation
- **Camera Integration**: Record video content directly in-app
- **File & Gallery Import**: Upload content from device storage
- **Video Recording**: Create and share performance videos
- **Flip Camera**: Switch between front and back cameras

### 🔐 Authentication
- **Email/Password Auth**: Traditional authentication via Firebase
- **Google Sign-In**: Quick OAuth authentication
- **Profile Customization**: Set up creative profile on first sign-in
- **Dev Mode**: Skip authentication for testing and demos

## 🏗️ Architecture

### Project Structure
```
dam-music/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── KanbanBoard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskModal.tsx
│   │   ├── SoundwaveVisualizer.tsx
│   │   └── messaging/       # Chat components
│   ├── screens/             # Application screens
│   │   ├── FeedScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ConnectionsScreen.tsx
│   │   ├── ManagementScreen.tsx
│   │   ├── ProjectWorkflowScreen.tsx
│   │   ├── UploadScreen.tsx
│   │   └── messaging/       # Chat screens
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── FeedNavigator.tsx
│   │   └── MessagingNavigator.tsx
│   ├── services/            # Business logic & API
│   │   ├── matchingService.ts
│   │   ├── audioService.ts
│   │   ├── authService.ts
│   │   ├── messageService.ts
│   │   ├── conversationService.ts
│   │   └── userDiscoveryService.ts
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── types/               # TypeScript definitions
│   ├── theme/               # Design system
│   ├── data/                # Mock data for development
│   └── utils/               # Utility functions
├── assets/                  # Images, videos, fonts
└── App.tsx                  # Root component
```

### Tech Stack

**Core Framework**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9.2

**Navigation**
- React Navigation 6.x
- Bottom Tabs Navigator
- Stack Navigator

**Media & Content**
- expo-av: Audio/video playback
- expo-camera: Camera integration
- expo-image-picker: Gallery access
- expo-document-picker: File uploads

**Backend & Auth**
- Firebase 12.5.0
- Firebase Authentication
- Firestore (NoSQL database)
- Firebase Storage (media files)

**UI & Styling**
- expo-linear-gradient
- React Native SVG
- Custom theme system
- Material Icons

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/swarit-1/dam-music.git
cd dam-music
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GOOGLE_WEB_CLIENT_ID=your_web_client_id
GOOGLE_IOS_CLIENT_ID=your_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
```

4. **Start the development server**
```bash
npm start
```

5. **Run on your platform**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

### Development Mode

The app includes a **Dev Mode** that skips authentication for testing:
- On the login screen, tap "Dev Skip Login" to bypass authentication
- This uses mock data and doesn't require Firebase configuration

## 📱 Core Screens

### Feed Screen
The main discovery interface with:
- Vertical swipe navigation
- Auto-playing media content
- Match percentage indicators
- Creator information overlay
- Connect/connection status
- Hold-to-pause gesture
- Expandable bio sections

### Profile Screen
Personal and creator profiles featuring:
- Profile header with avatar
- Bio and username
- Role and genre tags
- Song/video portfolio grid
- Connections list
- Edit profile options

### Management Screen
Project collaboration hub with:
- Active project cards
- Collaborator information
- Last activity timestamps
- Quick access to workflow boards

### Workflow Screen
Kanban-style project management:
- Swipeable boards (one per collaborator)
- Task cards with priority levels
- Create, edit, and delete tasks
- Assign tasks to team members
- Track task completion

### Messages Screen
Communication center with:
- Conversation list with previews
- Real-time message updates
- Direct and project chats
- Rich media message support

### Upload Screen
Content creation interface:
- Live camera preview
- Video recording with controls
- File picker integration
- Gallery import option

## 🧮 Matching Algorithm

The app uses a weighted scoring system to match creators:

```typescript
matchScore = (0.5 × genreMatch) + (0.3 × roleMatch) + (0.2 × skillOverlap)
```

**Genre Match (50%)**
- Compares user's preferred genres with post's genre
- Binary match (1.0 if matches, 0.0 if not)

**Role Match (30%)**
- Checks if user's role matches post's needed roles
- Higher weight for direct role matches

**Skill Overlap (20%)**
- Calculates intersection of user skills with post tags
- Rewards complementary skills

**Example:**
- User: Producer, genres: [lofi, rnb], skills: [mixing, mastering]
- Post: Vocalist, genre: lofi, needs: [producer], tags: [chill, vocal]
- Score: 0.5 (genre) + 0.3 (role) + 0.1 (skills) = **90% match**

## 🎨 Design System

### Color Palette
```typescript
{
  brandPurple: '#9D59E2',
  brandPurple700: '#7B3DB8',
  green: '#4CAF50',
  white: '#FFFFFF',
  black: '#000000',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  // ... additional color variants
}
```

### Typography
- Primary Font: League Spartan
- Accent Font: Kdam Thmor Pro
- Weights: Light, Regular, Medium, SemiBold, Bold

## 🔧 Configuration Files

### Firebase Setup
See `GOOGLE_SIGNIN_SETUP.md` for detailed OAuth configuration

### Expo Configuration (`app.json`)
- App name and slug
- Icon and splash screen
- Platform-specific settings
- Expo plugins (camera, video, fonts)

## 📦 Key Dependencies

```json
{
  "expo": "54.0.21",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "firebase": "^12.5.0",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/bottom-tabs": "^6.6.1",
  "expo-av": "^16.0.7",
  "expo-camera": "~17.0.10",
  "expo-linear-gradient": "^15.0.7"
}
```

## 🧪 Testing

### Demo Mode Features
- Skip authentication flow
- Pre-populated mock data
- Firebase error suppression
- Sample creator profiles
- Test conversations and tasks

### Test Users
The app includes mock data for:
- Sarah Chen (Vocalist)
- DJ Nova (Producer)
- Marcus Johnson (Guitarist)
- Emma Davis (Vocalist)
- And more...

## 🚧 Future Enhancements

- [ ] Real-time audio collaboration
- [ ] In-app audio mixing tools
- [ ] Push notifications
- [ ] Advanced search and filters
- [ ] Collaboration history tracking
- [ ] Achievement system
- [ ] Desktop web app
- [ ] Integration with streaming platforms

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- Swarit Pandey - Lead Developer

## 🤝 Contributing

This is a private project. For questions or collaboration inquiries, please contact the repository owner.

## 📞 Support

For issues or questions:
- Create an issue in the GitHub repository
- Contact: swarit-1 on GitHub

---

**Built with ❤️ by music creators, for music creators**
