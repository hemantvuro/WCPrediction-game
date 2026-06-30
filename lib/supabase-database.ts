import { supabase } from './supabase';
import { User, Fixture, Prediction, Team, PointsRule, LeaderboardEntry } from '@/types';

class SupabaseDatabase {
  // Users
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: userData.firstName,
        phone_number: userData.phoneNumber,
        points: userData.points || 0,
        is_admin: userData.isAdmin || false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);

    return {
      id: data.id,
      firstName: data.first_name,
      phoneNumber: data.phone_number,
      points: data.points,
      isAdmin: data.is_admin,
      createdAt: new Date(data.created_at),
    };
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      firstName: data.first_name,
      phoneNumber: data.phone_number,
      points: data.points,
      isAdmin: data.is_admin,
      createdAt: new Date(data.created_at),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      firstName: data.first_name,
      phoneNumber: data.phone_number,
      points: data.points,
      isAdmin: data.is_admin,
      createdAt: new Date(data.created_at),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get users: ${error.message}`);

    return data.map(user => ({
      id: user.id,
      firstName: user.first_name,
      phoneNumber: user.phone_number,
      points: user.points,
      isAdmin: user.is_admin,
      createdAt: new Date(user.created_at),
    }));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const updateData: any = {};
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
    if (updates.points !== undefined) updateData.points = updates.points;
    if (updates.isAdmin !== undefined) updateData.is_admin = updates.isAdmin;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      firstName: data.first_name,
      phoneNumber: data.phone_number,
      points: data.points,
      isAdmin: data.is_admin,
      createdAt: new Date(data.created_at),
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Fixtures
  async createFixture(fixtureData: Omit<Fixture, 'id'>): Promise<Fixture> {
    const { data, error } = await supabase
      .from('fixtures')
      .insert({
        team_a: fixtureData.teamA,
        team_b: fixtureData.teamB,
        team_a_flag: fixtureData.teamAFlag,
        team_b_flag: fixtureData.teamBFlag,
        stage: fixtureData.stage,
        group: fixtureData.group || null,
        match_date: fixtureData.matchDate.toISOString(),
        status: fixtureData.status,
        result: fixtureData.result || null,
        score_a: fixtureData.scoreA ?? null,
        score_b: fixtureData.scoreB ?? null,
        goal_scorers: fixtureData.goalScorers || null,
        external_id: fixtureData.externalId || null,
        enable_match_outcome: fixtureData.enableMatchOutcome !== false,
        enable_score_prediction: fixtureData.enableScorePrediction !== false,
        enable_scorer_prediction: fixtureData.enableScorerPrediction !== false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create fixture: ${error.message}`);

    return this.mapFixture(data);
  }

  async updateFixture(id: string, updates: Partial<Fixture>): Promise<Fixture | undefined> {
    console.log('updateFixture called with:', { id, updates });

    const updateData: any = {};
    if (updates.teamA !== undefined) updateData.team_a = updates.teamA;
    if (updates.teamB !== undefined) updateData.team_b = updates.teamB;
    if (updates.teamAFlag !== undefined) updateData.team_a_flag = updates.teamAFlag;
    if (updates.teamBFlag !== undefined) updateData.team_b_flag = updates.teamBFlag;
    if (updates.stage !== undefined) updateData.stage = updates.stage;
    if (updates.group !== undefined) updateData.group = updates.group || null;
    if (updates.matchDate !== undefined) updateData.match_date = updates.matchDate.toISOString();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.result !== undefined) updateData.result = updates.result || null;
    if (updates.scoreA !== undefined) updateData.score_a = updates.scoreA ?? null;
    if (updates.scoreB !== undefined) updateData.score_b = updates.scoreB ?? null;
    if (updates.goalScorers !== undefined) updateData.goal_scorers = updates.goalScorers || null;
    if (updates.enableMatchOutcome !== undefined) updateData.enable_match_outcome = updates.enableMatchOutcome;
    if (updates.enableScorePrediction !== undefined) updateData.enable_score_prediction = updates.enableScorePrediction;
    if (updates.enableScorerPrediction !== undefined) updateData.enable_scorer_prediction = updates.enableScorerPrediction;
    if (updates.externalId !== undefined) updateData.external_id = updates.externalId || null;

    console.log('Supabase update data:', updateData);

    const { data, error } = await supabase
      .from('fixtures')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    console.log('Supabase update response:', { data, error });

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update fixture: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from update');
      return undefined;
    }

    return this.mapFixture(data);
  }

  async getFixture(id: string): Promise<Fixture | undefined> {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return this.mapFixture(data);
  }

  async getAllFixtures(): Promise<Fixture[]> {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) throw new Error(`Failed to get fixtures: ${error.message}`);

    return data.map(this.mapFixture);
  }

  async getOpenFixtures(): Promise<Fixture[]> {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'open')
      .order('match_date', { ascending: true });

    if (error) throw new Error(`Failed to get open fixtures: ${error.message}`);

    return data.map(this.mapFixture);
  }

  async deleteFixture(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('fixtures')
      .delete()
      .eq('id', id);

    return !error;
  }

  async clearAllFixtures(): Promise<void> {
    const { error } = await supabase
      .from('fixtures')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw new Error(`Failed to clear fixtures: ${error.message}`);
  }

  private mapFixture(data: any): Fixture {
    return {
      id: data.id,
      teamA: data.team_a,
      teamB: data.team_b,
      teamAFlag: data.team_a_flag,
      teamBFlag: data.team_b_flag,
      stage: data.stage,
      group: data.group,
      matchDate: new Date(data.match_date),
      status: data.status,
      result: data.result,
      scoreA: data.score_a,
      scoreB: data.score_b,
      goalScorers: data.goal_scorers,
      externalId: data.external_id,
      enableMatchOutcome: data.enable_match_outcome,
      enableScorePrediction: data.enable_score_prediction,
      enableScorerPrediction: data.enable_scorer_prediction,
    };
  }

  // Predictions
  async createPrediction(predictionData: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prediction> {
    // Check if prediction already exists
    const existing = await this.getUserPredictionForFixture(predictionData.userId, predictionData.fixtureId);

    if (existing) {
      // Update existing prediction
      const updated = await this.updatePrediction(existing.id, {
        prediction: predictionData.prediction,
        scoreA: predictionData.scoreA,
        scoreB: predictionData.scoreB,
        goalScorers: predictionData.goalScorers,
      });

      if (!updated) {
        throw new Error('Failed to update existing prediction');
      }

      return updated;
    }

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: predictionData.userId,
        fixture_id: predictionData.fixtureId,
        prediction: predictionData.prediction,
        score_a: predictionData.scoreA ?? null,
        score_b: predictionData.scoreB ?? null,
        goal_scorers: predictionData.goalScorers || null,
        points_earned: predictionData.pointsEarned || 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create prediction: ${error.message}`);

    return this.mapPrediction(data);
  }

  async updatePrediction(id: string, updates: Partial<Omit<Prediction, 'id' | 'createdAt'>>): Promise<Prediction | undefined> {
    const updateData: any = {};
    if (updates.prediction !== undefined) updateData.prediction = updates.prediction;
    if (updates.scoreA !== undefined) updateData.score_a = updates.scoreA ?? null;
    if (updates.scoreB !== undefined) updateData.score_b = updates.scoreB ?? null;
    if (updates.goalScorers !== undefined) updateData.goal_scorers = updates.goalScorers || null;
    if (updates.pointsEarned !== undefined) updateData.points_earned = updates.pointsEarned;

    const { data, error } = await supabase
      .from('predictions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return this.mapPrediction(data);
  }

  async getUserPredictionForFixture(userId: string, fixtureId: string): Promise<Prediction | undefined> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('fixture_id', fixtureId)
      .single();

    if (error || !data) return undefined;

    return this.mapPrediction(data);
  }

  async getUserPredictions(userId: string): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId);

    if (error) return [];

    return data.map(this.mapPrediction);
  }

  async getAllPredictions(): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*');

    if (error) return [];

    return data.map(this.mapPrediction);
  }

  private mapPrediction(data: any): Prediction {
    return {
      id: data.id,
      userId: data.user_id,
      fixtureId: data.fixture_id,
      prediction: data.prediction,
      scoreA: data.score_a,
      scoreB: data.score_b,
      goalScorers: data.goal_scorers,
      pointsEarned: data.points_earned,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Teams
  async createTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: teamData.name,
        flag: teamData.flag,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create team: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      flag: data.flag,
      createdAt: new Date(data.created_at),
    };
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.flag !== undefined) updateData.flag = updates.flag;

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      flag: data.flag,
      createdAt: new Date(data.created_at),
    };
  }

  async deleteTeam(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      flag: data.flag,
      createdAt: new Date(data.created_at),
    };
  }

  async getAllTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) return [];

    return data.map(team => ({
      id: team.id,
      name: team.name,
      flag: team.flag,
      createdAt: new Date(team.created_at),
    }));
  }

  // Points Rules
  async getPointsRule(stage: string): Promise<PointsRule | undefined> {
    const { data, error} = await supabase
      .from('points_rules')
      .select('*')
      .eq('stage', stage)
      .single();

    if (error || !data) return undefined;

    return {
      stage: data.stage,
      resultPoints: data.correct_outcome,
      scorePoints: data.exact_score,
      goalScorerPoints: data.goal_scorers,
    };
  }

  async updatePointsRule(stage: string, updates: Partial<Omit<PointsRule, 'stage'>>): Promise<void> {
    const updateData: any = {};
    if (updates.resultPoints !== undefined) updateData.correct_outcome = updates.resultPoints;
    if (updates.scorePoints !== undefined) updateData.exact_score = updates.scorePoints;
    if (updates.goalScorerPoints !== undefined) updateData.goal_scorers = updates.goalScorerPoints;

    const { error } = await supabase
      .from('points_rules')
      .update(updateData)
      .eq('stage', stage);

    if (error) throw new Error(`Failed to update points rule: ${error.message}`);
  }

  async getAllPointsRules(): Promise<PointsRule[]> {
    const { data, error } = await supabase
      .from('points_rules')
      .select('*')
      .order('stage', { ascending: true });

    if (error) return [];

    return data.map(rule => ({
      stage: rule.stage,
      resultPoints: rule.correct_outcome,
      scorePoints: rule.exact_score,
      goalScorerPoints: rule.goal_scorers,
    }));
  }

  // Leaderboard
  async calculateLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = await this.getAllUsers();
    const predictions = await this.getAllPredictions();
    const fixtures = await this.getAllFixtures();

    const leaderboard: LeaderboardEntry[] = users.map(user => {
      const userPredictions = predictions.filter(p => p.userId === user.id);

      let totalPoints = 0;
      let correctPredictions = 0;
      let exactScores = 0;

      userPredictions.forEach(pred => {
        const fixture = fixtures.find(f => f.id === pred.fixtureId);
        if (!fixture || fixture.status !== 'completed' || !fixture.result) return;

        const rule = this.getPointsRuleSync(fixture.stage);
        let points = 0;

        // Check outcome
        if (pred.prediction === fixture.result) {
          points += rule.resultPoints;
          correctPredictions++;

          // Check exact score
          if (pred.scoreA === fixture.scoreA && pred.scoreB === fixture.scoreB) {
            points += rule.scorePoints;
            exactScores++;
          }
        }

        // Check goal scorers - count multiple goals by same player
        if (pred.goalScorers && fixture.goalScorers && pred.goalScorers.length > 0) {
          let scorerPoints = 0;
          pred.goalScorers.forEach(predictedScorer => {
            // Count how many times this predicted player actually scored
            const goalsScored = fixture.goalScorers!.filter(s => s === predictedScorer).length;
            scorerPoints += goalsScored * rule.goalScorerPoints;
          });
          points += scorerPoints;
        }

        totalPoints += points;
      });

      // If admin has set manual points, use ONLY those (override calculated points)
      // Otherwise use the calculated points from predictions
      const finalPoints = user.points !== undefined && user.points !== 0 ? user.points : totalPoints;

      return {
        userId: user.id,
        userName: user.firstName,
        totalPoints: finalPoints,
        correctPredictions,
        exactScores,
        rank: 0,
        previousRank: 0,
        pointsChange: 0,
      };
    });

    // Sort by points and assign ranks
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  private getPointsRuleSync(stage: string): PointsRule {
    // Default rules - these should match what's in the database
    const rules: Record<string, PointsRule> = {
      'group': { stage: 'group', resultPoints: 2, scorePoints: 2, goalScorerPoints: 0 },
      'round32': { stage: 'round32', resultPoints: 3, scorePoints: 3, goalScorerPoints: 1 },
      'round16': { stage: 'round16', resultPoints: 4, scorePoints: 4, goalScorerPoints: 1 },
      'quarter': { stage: 'quarter', resultPoints: 5, scorePoints: 5, goalScorerPoints: 2 },
      'semi': { stage: 'semi', resultPoints: 6, scorePoints: 6, goalScorerPoints: 2 },
      'third_place': { stage: 'third_place', resultPoints: 6, scorePoints: 6, goalScorerPoints: 2 },
      'final': { stage: 'final', resultPoints: 10, scorePoints: 10, goalScorerPoints: 3 },
    };
    return rules[stage] || rules['group'];
  }
}

export const supabaseDb = new SupabaseDatabase();
