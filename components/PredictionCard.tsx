'use client';

import { useState, useEffect } from 'react';
import { Fixture, PredictionResult, Prediction } from '@/types';

interface PredictionCardProps {
  fixture: Fixture;
  existingPrediction?: Prediction;
  onPredict: (fixtureId: string, prediction: PredictionResult, scoreA?: number, scoreB?: number, goalScorers?: string[]) => Promise<void>;
}

interface FixtureStats {
  total: number;
  outcomes: {
    teamA: number;
    teamB: number;
    draw: number;
  };
  scores: Array<{ scoreA: number; scoreB: number; count: number }>;
  confidence: 'high' | 'medium' | 'low';
}

export default function PredictionCard({ fixture, existingPrediction, onPredict }: PredictionCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<PredictionResult | null>(null);
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');
  const [goalScorer1, setGoalScorer1] = useState<string>('');
  const [goalScorer2, setGoalScorer2] = useState<string>('');
  const [goalScorer3, setGoalScorer3] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<FixtureStats | null>(null);

  const isGroupStage = fixture.stage === 'group';

  const enableMatchOutcome = fixture.enableMatchOutcome !== false;
  const enableScorePrediction = fixture.enableScorePrediction !== false;
  const enableScorerPrediction = fixture.enableScorerPrediction !== false;

  // Initialize state from existingPrediction on mount and when it changes
  useEffect(() => {
    console.log('📥 Loading existing prediction:', existingPrediction);
    if (existingPrediction) {
      setSelectedOutcome(existingPrediction.prediction);
      setScoreA(existingPrediction.scoreA?.toString() || '');
      setScoreB(existingPrediction.scoreB?.toString() || '');
      setGoalScorer1(existingPrediction.goalScorers?.[0] || '');
      setGoalScorer2(existingPrediction.goalScorers?.[1] || '');
      setGoalScorer3(existingPrediction.goalScorers?.[2] || '');
      console.log('✅ State updated:', {
        outcome: existingPrediction.prediction,
        scoreA: existingPrediction.scoreA,
        scoreB: existingPrediction.scoreB,
      });
    }
  }, [existingPrediction?.id, existingPrediction?.prediction, existingPrediction?.scoreA, existingPrediction?.scoreB]);

  // Fetch stats for all fixtures (not just after user predicts)
  useEffect(() => {
    if (!isExpired) {
      fetchStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [fixture.id, isExpired]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/fixtures/${fixture.id}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const matchTime = new Date(fixture.matchDate).getTime();
      const distance = matchTime - now;

      if (distance < 0) {
        setCountdown('Match Started');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      setIsExpired(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [fixture.matchDate]);

  // Auto-save when any prediction changes
  useEffect(() => {
    if (isExpired) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedOutcome, scoreA, scoreB, goalScorer1, goalScorer2, goalScorer3, isExpired]);

  const handleAutoSave = async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves

    let prediction: PredictionResult | null = null;
    let scoreANum: number | undefined = undefined;
    let scoreBNum: number | undefined = undefined;

    // Parse scores if entered (always save them if provided)
    if (enableScorePrediction && scoreA !== '' && scoreB !== '') {
      scoreANum = parseInt(scoreA);
      scoreBNum = parseInt(scoreB);

      // Validate parsed numbers
      if (isNaN(scoreANum) || isNaN(scoreBNum)) {
        console.log('⚠️ Invalid scores, skipping save');
        return;
      }
    }

    // Determine prediction based on enabled sections
    if (enableMatchOutcome && selectedOutcome) {
      // Use selected outcome
      prediction = selectedOutcome;
    } else if (scoreANum !== undefined && scoreBNum !== undefined) {
      // Derive prediction from score
      if (scoreANum > scoreBNum) {
        prediction = 'teamA';
      } else if (scoreBNum > scoreANum) {
        prediction = 'teamB';
      } else {
        prediction = isGroupStage ? 'draw' : 'teamA';
      }
    }

    if (!prediction) return;

    setIsSaving(true);

    try {
      const goalScorers = enableScorerPrediction
        ? [goalScorer1, goalScorer2, goalScorer3].filter(Boolean)
        : undefined;

      console.log('💾 Saving prediction:', {
        fixtureId: fixture.id,
        prediction,
        scoreA: scoreANum,
        scoreB: scoreBNum,
        goalScorers,
      });

      await onPredict(
        fixture.id,
        prediction,
        scoreANum,
        scoreBNum,
        goalScorers
      );

      console.log('✅ Save complete');

      // Fetch stats after saving
      fetchStats();
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const indiaDate = new Date(date);
    return indiaDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-all">
      {/* Match Outcome Section */}
      {enableMatchOutcome && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b-2 border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">
            Who Will Win?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => !isExpired && setSelectedOutcome('teamA')}
              disabled={isExpired}
              className={`py-4 px-3 rounded-lg font-bold text-sm transition-all ${
                selectedOutcome === 'teamA'
                  ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-blue-200 hover:border-blue-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-1">{fixture.teamAFlag}</div>
              <div className="text-xs">{fixture.teamA}</div>
            </button>

            <button
              onClick={() => !isExpired && setSelectedOutcome('teamB')}
              disabled={isExpired}
              className={`py-4 px-3 rounded-lg font-bold text-sm transition-all ${
                selectedOutcome === 'teamB'
                  ? 'bg-purple-500 text-white border-2 border-purple-600 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-1">{fixture.teamBFlag}</div>
              <div className="text-xs">{fixture.teamB}</div>
            </button>
          </div>
        </div>
      )}

      {/* Score Prediction Section */}
      {enableScorePrediction && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-b-2 border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">
            Predict the Score
          </h3>
          <div className="flex items-center gap-3 justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-2 font-medium">{fixture.teamAFlag} {fixture.teamA}</div>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                disabled={isExpired}
                placeholder="0"
                className="w-14 px-2 py-2 border-2 border-blue-300 rounded-lg text-center text-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-2xl font-bold text-gray-400 mt-6">-</span>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-2 font-medium">{fixture.teamBFlag} {fixture.teamB}</div>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                disabled={isExpired}
                placeholder="0"
                className="w-14 px-2 py-2 border-2 border-purple-300 rounded-lg text-center text-xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Goal Scorers Section */}
      {enableScorerPrediction && (
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-b-2 border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">
            🎯 Predict Goal Scorers (Bonus Points)
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              value={goalScorer1}
              onChange={(e) => setGoalScorer1(e.target.value)}
              disabled={isExpired}
              placeholder="First Goal Scorer"
              className="w-full px-2 py-1.5 border border-yellow-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
            />
            <input
              type="text"
              value={goalScorer2}
              onChange={(e) => setGoalScorer2(e.target.value)}
              disabled={isExpired}
              placeholder="Second Goal Scorer"
              className="w-full px-2 py-1.5 border border-yellow-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
            />
            <input
              type="text"
              value={goalScorer3}
              onChange={(e) => setGoalScorer3(e.target.value)}
              disabled={isExpired}
              placeholder="Third Goal Scorer"
              className="w-full px-2 py-1.5 border border-yellow-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      )}

      {/* Crowd Stats - Visible for all fixtures */}
      {stats && stats.total > 0 && !isExpired && (
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-b-2 border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center flex items-center justify-center gap-2">
            📊 CROWD PREDICTIONS
            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
              {stats.total} {stats.total === 1 ? 'prediction' : 'predictions'}
            </span>
          </h3>

          {/* Confidence Badge */}
          <div className="flex justify-center mb-4">
            {stats.confidence === 'high' && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-300">
                🔥 High Confidence
              </div>
            )}
            {stats.confidence === 'medium' && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-300">
                🤔 Medium Confidence
              </div>
            )}
            {stats.confidence === 'low' && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-300">
                🤷 Mixed Predictions
              </div>
            )}
          </div>

          {/* Outcome Breakdown */}
          {enableMatchOutcome && (
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-600 mb-2">Match Outcome:</div>
              <div className="space-y-2">
                {stats.outcomes.teamA > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{fixture.teamAFlag} {fixture.teamA}</span>
                      <span className="font-bold text-blue-700">{((stats.outcomes.teamA / stats.total) * 100).toFixed(0)}% ({stats.outcomes.teamA})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.outcomes.teamA / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {stats.outcomes.teamB > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{fixture.teamBFlag} {fixture.teamB}</span>
                      <span className="font-bold text-purple-700">{((stats.outcomes.teamB / stats.total) * 100).toFixed(0)}% ({stats.outcomes.teamB})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.outcomes.teamB / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {stats.outcomes.draw > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">Draw</span>
                      <span className="font-bold text-gray-700">{((stats.outcomes.draw / stats.total) * 100).toFixed(0)}% ({stats.outcomes.draw})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.outcomes.draw / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Popular Scores */}
          {enableScorePrediction && stats.scores.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-600 mb-2">Most Popular Scores:</div>
              <div className="space-y-1">
                {stats.scores.slice(0, 3).map((score, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1 border border-orange-200">
                    <span className="font-bold text-gray-800">{score.scoreA} - {score.scoreB}</span>
                    <span className="text-orange-700 font-semibold">{score.count} {score.count === 1 ? 'pick' : 'picks'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date, Time, and Countdown - Always Visible */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="text-center mb-3">
          <div className="text-sm font-semibold text-gray-700">
            {formatDate(fixture.matchDate)}
          </div>
        </div>

        <div className={`text-center py-2 px-3 rounded-lg text-xs font-bold ${
          isExpired
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border border-orange-300'
        }`}>
          {isExpired ? (
            <span>⏱️ Predictions Closed</span>
          ) : (
            <span>⏱️ {countdown}</span>
          )}
        </div>

        {/* Persistent "Saved" indicator - always shows if prediction exists */}
        {existingPrediction && !isExpired && (
          <div className="mt-3 bg-green-50 rounded-lg p-2 border border-green-200">
            <p className="text-xs text-center text-green-700 font-semibold">
              {isSaving ? '💾 Saving...' : '✓ Saved'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
