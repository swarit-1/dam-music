export interface User {
  id: string;
  name: string;
  role: string[]; // e.g., ["producer", "vocalist"]
  skills: string[]; // e.g., ["mixing", "songwriting"]
  genres: string[]; // e.g., ["pop", "lofi", "rnb"]
  location: string; // e.g., "Austin, TX"
  avatar?: string;
}

export interface Post {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_role: string[];
  audio_clip_url: string;
  video_url?: string; // Optional video content
  genre: string;
  tags: string[];
  roles_needed: string[]; // e.g., ["vocalist", "guitarist"]
  created_at: string;
  score?: number; // Calculated match score
}

export interface ScoredPost extends Post {
  score: number;
}
