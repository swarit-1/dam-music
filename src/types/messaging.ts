export type MessageType = 
  | 'text' 
  | 'audio' 
  | 'video' 
  | 'file' 
  | 'voice-note'
  | 'collaboration-request' 
  | 'project-invitation'
  | 'audio-timestamp-comment'
  | 'link-preview';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ConversationType = 'direct' | 'project-group';

export type ProjectRole = 
  | 'owner'
  | 'producer' 
  | 'vocalist' 
  | 'engineer' 
  | 'guitarist'
  | 'drummer'
  | 'bassist'
  | 'keyboardist'
  | 'manager'
  | 'collaborator';

export type CollaborationStatus = 'pending' | 'accepted' | 'declined';

export interface UserProfile {
  id: string;
  displayName: string;
  artistName?: string;
  email: string;
  avatar?: string;
  genres: string[];
  skills: string[];
  roles: string[];
  location?: string;
  timezone?: string;
  portfolioLinks?: string[];
  recentProjects?: string[];
  bio?: string;
  lookingForCollaborators?: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface AudioMetadata {
  duration: number; 
  waveformData?: number[];
  bpm?: number;
  key?: string; 
  format: string; 
  size: number; 
  versionNumber?: string; 
  url?: string;
}

export interface FileMetadata {
  name: string;
  type: string; // MIME type
  size: number;
  format: string; // e.g., "pdf", "midi", "zip"
  url: string;
  thumbnailUrl?: string;
  versionNumber?: string;
}

export interface VideoMetadata {
  duration: number;
  thumbnailUrl?: string;
  size: number;
  format: string;
  url: string;
}

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  platform?: 'spotify' | 'soundcloud' | 'youtube' | 'apple-music' | 'other';
}

export interface CollaborationRequestData {
  projectTitle?: string;
  projectDescription?: string;
  rolesNeeded: string[];
  status: CollaborationStatus;
  respondedAt?: Date;
}

export interface ProjectInvitationData {
  projectId: string;
  projectTitle: string;
  projectDescription?: string;
  projectGenre?: string;
  role: ProjectRole;
  status: CollaborationStatus;
  respondedAt?: Date;
}

export interface AudioTimestampComment {
  audioFileId: string;
  audioFileName: string;
  timestamp: number; // in seconds
  comment: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string; 
  timestamp: Date;
  status: MessageStatus;
  
  audioMetadata?: AudioMetadata;
  fileMetadata?: FileMetadata;
  videoMetadata?: VideoMetadata;
  linkPreview?: LinkPreviewData;
  collaborationRequest?: CollaborationRequestData;
  projectInvitation?: ProjectInvitationData;
  audioTimestampComment?: AudioTimestampComment;
        
  reactions?: MessageReaction[];
  replyTo?: string; 
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: Date;
  
  readBy?: { [userId: string]: Date };
  deliveredTo?: { [userId: string]: Date };
  editedAt?: Date;
  deletedAt?: Date;
}

export interface ConversationParticipant {
  userId: string;
  displayName: string;
  avatar?: string;
  role?: ProjectRole; 
  joinedAt: Date;
  isAdmin?: boolean;
  isMuted?: boolean;
  lastReadAt?: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  participantIds: string[]; 
  
  title?: string; 
  avatar?: string; 
  description?: string;
  
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    type: MessageType;
  };
  
  projectId?: string;
  projectGenre?: string;
  projectMetadata?: ProjectMetadata;
  
  pinnedMessages?: string[]; 
  sharedFiles?: SharedFile[];
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  isArchived?: boolean;
  archivedBy?: string[];
  
  // Unread tracking per user
  unreadCount?: { [userId: string]: number };
}

export interface ProjectMetadata {
  title: string;
  description?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  members: ProjectMember[];
  deadlines?: Deadline[];
  milestones?: Milestone[];
  status: 'active' | 'completed' | 'on-hold';
}

export interface ProjectMember {
  userId: string;
  displayName: string;
  role: ProjectRole;
  avatar?: string;
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  description?: string;
  completed?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completedAt?: Date;
}

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  metadata?: AudioMetadata | FileMetadata | VideoMetadata;
  versionNumber?: string;
  previousVersionId?: string; // Link to previous version
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  activeConversationId?: string;
}

// For chat list display
export interface ConversationListItem {
  conversation: Conversation;
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageTime: Date;
  otherParticipant?: UserProfile; // For direct chats
  isTyping?: boolean;
  typingUsers?: string[]; // User names
}

// Upload progress tracking
export interface UploadProgress {
  messageId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'failed';
  error?: string;
}

// Notification preferences
export interface NotificationSettings {
  conversationId: string;
  userId: string;
  isMuted: boolean;
  mutedUntil?: Date;
  pushEnabled: boolean;
  showPreviews: boolean;
}

// Search and filter types
export interface MessageSearchFilters {
  conversationId?: string;
  senderId?: string;
  messageType?: MessageType;
  dateFrom?: Date;
  dateTo?: Date;
  hasAudio?: boolean;
  hasFiles?: boolean;
  searchQuery?: string;
}

// Firestore document references for type safety
export interface FirestoreConversation extends Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'lastMessage'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: any;
    type: MessageType;
  };
}

export interface FirestoreMessage extends Omit<Message, 'id' | 'timestamp' | 'readBy' | 'deliveredTo'> {
  timestamp: any;
  readBy?: { [userId: string]: any };
  deliveredTo?: { [userId: string]: any };
}

