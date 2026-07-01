export type MatchStage = 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final';

export type MatchStatus = 'locked' | 'open' | 'completed';

export type PredictionResult = 'teamA' | 'draw' | 'teamB';

export interface User {
  id: string;
  firstName: string;
  phoneNumber: string;
  createdAt: Date;
  points?: number; // Admin-editable points
  isAdmin?: boolean; // Admin flag
}

export interface Team {
  id: string;
  name: string;
  flag: string;
  createdAt: Date;
}

export interface Fixture {
  id: string;
  teamA: string;
  teamB: string;
  teamAFlag: string;
  teamBFlag: string;
  stage: MatchStage;
  group?: string; // Group A, B, C, etc. (only for group stage)
  matchDate: Date;
  status: MatchStatus;
  result?: PredictionResult;
  scoreA?: number;
  scoreB?: number;
  goalScorers?: string[];
  externalId?: string; // API-Football fixture ID for fetching goal scorers
  enableMatchOutcome?: boolean;
  enableScorePrediction?: boolean;
  enableScorerPrediction?: boolean;
}

export interface Prediction {
  id: string;
  userId: string;
  fixtureId: string;
  prediction: PredictionResult;
  scoreA?: number;
  scoreB?: number;
  goalScorers?: string[];
  pointsEarned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsRule {
  stage: MatchStage;
  resultPoints: number;
  scorePoints: number;
  goalScorerPoints: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  rank: number;
  previousRank?: number;
  pointsChange: number;
  correctPredictions?: number;
  exactScores?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalFixtures: number;
  totalPredictions: number;
  openFixtures: number;
}
