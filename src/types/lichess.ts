export type GameMode = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'correspondence' | 'ultraBullet' | 'chess960' | 'crazyhouse' | 'antichess' | 'atomic' | 'horde' | 'kingOfTheHill' | 'racingKings' | 'threeCheck';

export interface PlayerRatings {
  bullet?: { games: number; rating: number; rd: number; prog: number };
  blitz?: { games: number; rating: number; rd: number; prog: number };
  rapid?: { games: number; rating: number; rd: number; prog: number };
  classical?: { games: number; rating: number; rd: number; prog: number };
  correspondence?: { games: number; rating: number; rd: number; prog: number };
  ultraBullet?: { games: number; rating: number; rd: number; prog: number };
}

export interface LichessUser {
  id: string;
  username: string;
  title?: string;
  online?: boolean;
  playing?: boolean;
  createdAt: number;
  seenAt?: number;
  profile?: {
    country?: string;
    location?: string;
    bio?: string;
    firstName?: string;
    lastName?: string;
  };
  nbFollowers?: number;
  nbFollowing?: number;
  completionRate?: number;
  perfs: PlayerRatings;
  count?: {
    all: number;
    rated: number;
    ai: number;
    draw: number;
    drawH: number;
    loss: number;
    lossH: number;
    win: number;
    winH: number;
    bookmark: number;
    playing: number;
    import: number;
    me: number;
  };
  playTime?: {
    total: number;
    tv: number;
  };
  patron?: boolean;
  disabled?: boolean;
  tosViolation?: boolean;
}

export interface GamePlayer {
  user?: { id: string; name: string; title?: string; patron?: boolean };
  rating?: number;
  ratingDiff?: number;
  aiLevel?: number;
  provisional?: boolean;
}

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: GamePlayer;
    black: GamePlayer;
  };
  winner?: 'white' | 'black';
  opening?: {
    eco: string;
    name: string;
    ply: number;
  };
  moves?: string;
  clock?: {
    initial: number;
    increment: number;
    totalTime: number;
  };
  pgn?: string;
}

export interface UserStatus {
  id: string;
  name: string;
  online: boolean;
  playing: boolean;
  playingId?: string;
}

export interface TrackedPlayer {
  username: string;
  addedAt: number;
  trackingEnabled: boolean;
  cachedProfile?: LichessUser;
  lastChecked?: number;
  currentGameId?: string;
  notifiedGameId?: string;
}

export interface NotificationRecord {
  id: string;
  playerUsername: string;
  gameId: string;
  gameMode: string;
  opponentName: string;
  opponentRating?: number;
  timestamp: number;
  read: boolean;
}

export interface AppSettings {
  pollingInterval: number; // saniye
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}
