import { User, Fixture, Prediction, PointsRule, LeaderboardEntry, Team } from '@/types';

export class Database {
  private users: Map<string, User> = new Map();
  private fixtures: Map<string, Fixture> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private teams: Map<string, Team> = new Map();
  private pointsRules: PointsRule[] = [
    { stage: 'group', resultPoints: 2, scorePoints: 2, goalScorerPoints: 0 },
    { stage: 'round32', resultPoints: 2, scorePoints: 2, goalScorerPoints: 0 },
    { stage: 'round16', resultPoints: 2, scorePoints: 2, goalScorerPoints: 0 },
    { stage: 'quarter', resultPoints: 2, scorePoints: 2, goalScorerPoints: 0 },
    { stage: 'semi', resultPoints: 2, scorePoints: 2, goalScorerPoints: 1 },
    { stage: 'third_place', resultPoints: 2, scorePoints: 2, goalScorerPoints: 1 },
    { stage: 'final', resultPoints: 2, scorePoints: 2, goalScorerPoints: 1 },
  ];

  // Users
  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  getUserByPhone(phoneNumber: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.phoneNumber === phoneNumber
    );
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Fixtures
  createFixture(fixture: Omit<Fixture, 'id'>): Fixture {
    const id = `fixture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFixture: Fixture = {
      ...fixture,
      id,
    };
    this.fixtures.set(id, newFixture);
    return newFixture;
  }

  updateFixture(id: string, updates: Partial<Fixture>): Fixture | undefined {
    const fixture = this.fixtures.get(id);
    if (!fixture) return undefined;
    const updated = { ...fixture, ...updates };
    this.fixtures.set(id, updated);
    return updated;
  }

  getFixture(id: string): Fixture | undefined {
    return this.fixtures.get(id);
  }

  getAllFixtures(): Fixture[] {
    return Array.from(this.fixtures.values()).sort(
      (a, b) => a.matchDate.getTime() - b.matchDate.getTime()
    );
  }

  getOpenFixtures(): Fixture[] {
    return this.getAllFixtures().filter((f) => f.status === 'open');
  }

  // Predictions
  createPrediction(prediction: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>): Prediction {
    const existingPrediction = this.getUserPredictionForFixture(
      prediction.userId,
      prediction.fixtureId
    );

    if (existingPrediction) {
      return this.updatePrediction(existingPrediction.id, {
        prediction: prediction.prediction,
        scoreA: prediction.scoreA,
        scoreB: prediction.scoreB,
        goalScorers: prediction.goalScorers,
      })!;
    }

    const id = `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPrediction: Prediction = {
      ...prediction,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }

  updatePrediction(id: string, updates: Partial<Omit<Prediction, 'id' | 'createdAt'>>): Prediction | undefined {
    const prediction = this.predictions.get(id);
    if (!prediction) return undefined;
    const updated = {
      ...prediction,
      ...updates,
      updatedAt: new Date(),
    };
    this.predictions.set(id, updated);
    return updated;
  }

  getUserPredictionForFixture(userId: string, fixtureId: string): Prediction | undefined {
    return Array.from(this.predictions.values()).find(
      (p) => p.userId === userId && p.fixtureId === fixtureId
    );
  }

  getUserPredictions(userId: string): Prediction[] {
    return Array.from(this.predictions.values()).filter((p) => p.userId === userId);
  }

  getAllPredictions(): Prediction[] {
    return Array.from(this.predictions.values());
  }

  // Points Rules
  getPointsRule(stage: string): PointsRule | undefined {
    return this.pointsRules.find((r) => r.stage === stage);
  }

  updatePointsRule(stage: string, updates: Partial<Omit<PointsRule, 'stage'>>): void {
    const index = this.pointsRules.findIndex((r) => r.stage === stage);
    if (index !== -1) {
      this.pointsRules[index] = { ...this.pointsRules[index], ...updates };
    }
  }

  getAllPointsRules(): PointsRule[] {
    return this.pointsRules;
  }

  deleteFixture(id: string): boolean {
    return this.fixtures.delete(id);
  }

  clearAllFixtures(): void {
    this.fixtures.clear();
  }

  // Teams
  createTeam(team: Omit<Team, 'id' | 'createdAt'>): Team {
    const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTeam: Team = {
      ...team,
      id,
      createdAt: new Date(),
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  updateTeam(id: string, updates: Partial<Team>): Team | undefined {
    const team = this.teams.get(id);
    if (!team) return undefined;
    const updated = { ...team, ...updates };
    this.teams.set(id, updated);
    return updated;
  }

  deleteTeam(id: string): boolean {
    return this.teams.delete(id);
  }

  getTeam(id: string): Team | undefined {
    return this.teams.get(id);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Leaderboard
  calculateLeaderboard(): LeaderboardEntry[] {
    const userPoints = new Map<string, number>();

    Array.from(this.users.values()).forEach(user => {
      userPoints.set(user.id, user.points !== undefined ? user.points : 0);
    });

    Array.from(this.predictions.values()).forEach(prediction => {
      const fixture = this.fixtures.get(prediction.fixtureId);
      if (!fixture || fixture.status !== 'completed' || !fixture.result) {
        return;
      }

      const rule = this.getPointsRule(fixture.stage);
      if (!rule) return;

      let points = 0;

      if (prediction.prediction === fixture.result) {
        points += rule.resultPoints;
      }

      if (
        prediction.scoreA !== undefined &&
        prediction.scoreB !== undefined &&
        fixture.scoreA !== undefined &&
        fixture.scoreB !== undefined
      ) {
        if (prediction.scoreA === fixture.scoreA && prediction.scoreB === fixture.scoreB) {
          points += rule.scorePoints;
        }
      }

      if (prediction.goalScorers && fixture.goalScorers && rule.goalScorerPoints > 0) {
        for (const scorer of prediction.goalScorers) {
          if (fixture.goalScorers.includes(scorer)) {
            points += rule.goalScorerPoints;
          }
        }
      }

      // Only add calculated points if user doesn't have manual points override
      const user = this.users.get(prediction.userId);
      if (user && user.points === undefined) {
        const currentPoints = userPoints.get(prediction.userId) || 0;
        userPoints.set(prediction.userId, currentPoints + points);
      }
    });

    const entries: LeaderboardEntry[] = [];
    Array.from(userPoints.entries()).forEach(([userId, totalPoints]) => {
      const user = this.users.get(userId);
      if (user) {
        entries.push({
          userId,
          userName: user.firstName,
          totalPoints,
          rank: 0,
          pointsChange: 0,
        });
      }
    });

    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }
}

export const db = new Database();
