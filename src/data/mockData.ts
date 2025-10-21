import { User, Post } from '../types';

// Mock current user
export const mockUser: User = {
  id: 'user123',
  name: 'Alex Morgan',
  role: ['producer', 'mixing engineer'],
  skills: ['mixing', 'mastering', 'beat-making', 'synth'],
  genres: ['lofi', 'rnb', 'electronic'],
  location: 'Austin, TX',
};

// Mock posts with various audio clips
export const mockPosts: Post[] = [
  {
    id: 'post1',
    creator_id: 'user456',
    creator_name: 'Sarah Chen',
    creator_role: ['vocalist', 'songwriter'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'lofi',
    tags: ['chill', 'vocal', 'songwriting'],
    roles_needed: ['producer', 'mixing engineer'],
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: 'post2',
    creator_id: 'user789',
    creator_name: 'Marcus Johnson',
    creator_role: ['guitarist', 'composer'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'rnb',
    tags: ['smooth', 'guitar', 'jazzy'],
    roles_needed: ['vocalist', 'producer'],
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: 'post3',
    creator_id: 'user101',
    creator_name: 'Emma Davis',
    creator_role: ['vocalist', 'lyricist'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'pop',
    tags: ['upbeat', 'catchy', 'vocal'],
    roles_needed: ['producer', 'beat-maker'],
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
  },
  {
    id: 'post4',
    creator_id: 'user202',
    creator_name: 'DJ Nova',
    creator_role: ['producer', 'dj'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'electronic',
    tags: ['synth', 'edm', 'dance'],
    roles_needed: ['vocalist', 'songwriter'],
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 'post5',
    creator_id: 'user303',
    creator_name: 'Liam Park',
    creator_role: ['pianist', 'composer'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'lofi',
    tags: ['piano', 'chill', 'ambient'],
    roles_needed: ['mastering', 'mixing engineer'],
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(), // 2.5 hours ago
  },
  {
    id: 'post6',
    creator_id: 'user404',
    creator_name: 'Zara Williams',
    creator_role: ['rapper', 'songwriter'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    genre: 'hip-hop',
    tags: ['rap', 'lyrical', 'storytelling'],
    roles_needed: ['producer', 'beat-maker'],
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'post7',
    creator_id: 'user505',
    creator_name: 'Oliver Smith',
    creator_role: ['bassist', 'producer'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    genre: 'rnb',
    tags: ['bass', 'groovy', 'smooth'],
    roles_needed: ['vocalist', 'guitarist'],
    created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(), // 3.5 hours ago
  },
  {
    id: 'post8',
    creator_id: 'user606',
    creator_name: 'Maya Anderson',
    creator_role: ['vocalist', 'topliner'],
    audio_clip_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'electronic',
    tags: ['vocal', 'melodic', 'synth'],
    roles_needed: ['producer', 'mixing engineer'],
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
  },
];
