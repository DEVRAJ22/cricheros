export interface Player {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  playingXI: Player[];
}

export interface FieldDirection {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
  angle: number; // Degrees
  distance: number; // Normalized 0 to 1
}

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'none';
export type WicketType = 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'none';

export interface BallOutcome {
  runs: number; // Runs off bat or extras that count as runs
  extras: number; // Additional runs (e.g., wide +1)
  extraType: ExtraType;
  isWicket: boolean;
  wicketType: WicketType;
  wicketPlayerId?: string; // Who got out
}

export interface Ball {
  id: string;
  overNumber: number;
  ballNumber: number; // Ball in the over (1-6+)
  bowlerId: string;
  strikerId: string;
  nonStrikerId: string;
  outcome: BallOutcome;
  fieldDirection?: FieldDirection;
  commentary: string;
  timestamp: number;
}

export interface BatsmanStats {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isStriker: boolean;
}

export interface BowlerStats {
  playerId: string;
  overs: number; // e.g. 1.2
  maidens: number;
  runs: number;
  wickets: number;
}

export interface MatchState {
  id: string;
  teamA: Team;
  teamB: Team;
  battingTeamId: 'TeamA' | 'TeamB';
  bowlingTeamId: 'TeamA' | 'TeamB';
  
  // Current Play State
  currentBatsmen: {
    strikerId: string;
    nonStrikerId: string;
  };
  currentBowlerId: string;
  
  // Score
  totalRuns: number;
  wickets: number;
  overs: number; // Completed legal overs (e.g. 5)
  ballsInCurrentOver: number; // Legal balls in current over (0-5)
  
  // History
  balls: Ball[];
  
  // Status
  status: 'setup' | 'live' | 'completed';
  statusMessage?: string;
  
  // Derived stats cache (optional, but helpful)
  playerStats: Record<string, { runs: number, balls: number, wickets: number, overs: number }>;
}
