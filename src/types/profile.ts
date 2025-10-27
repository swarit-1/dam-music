export interface Song {
    id: string;
    title: string;
    artist: string;
    duration: number; // in seconds
    audioUrl: string;
    uploadedAt: Date;
    coverImage?: string;
}

export interface Connection {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    connectionType: "following" | "follower" | "mutual";
    connectedAt: Date;
}

export interface Profile {
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
