'use client';

import { Fixture, Prediction, LeaderboardEntry, PredictionResult } from '@/types';
import PredictionCard from './PredictionCard';
import { getBadges } from '@/lib/badges';

interface DashboardTabProps {
  openFixtures: Fixture[];
  predictions: Prediction[];
  userStats: LeaderboardEntry | null;
  totalFixtures: number;
  leaderboard: LeaderboardEntry[];
  onPredict: (
    fixtureId: string,
    prediction: PredictionResult,
    scoreA?: number,
    scoreB?: number,
    goalScorers?: string[]
  ) => Promise<void>;
}

export default function DashboardTab({
  openFixtures,
  predictions,
  userStats,
  totalFixtures,
  leaderboard,
  onPredict,
}: DashboardTabProps) {
  const accuracy = totalFixtures > 0 && userStats
    ? ((userStats.correctPredictions || 0) / totalFixtures * 100).toFixed(0)
    : 0;
  const avgPoints = totalFixtures > 0 && userStats
    ? (userStats.totalPoints / totalFixtures).toFixed(1)
    : 0;
  const badges = userStats ? getBadges({
    rank: userStats.rank,
    totalPoints: userStats.totalPoints,
    correctPredictions: userStats.correctPredictions || 0,
    exactScores: userStats.exactScores || 0,
    pointsChange: userStats.pointsChange || 0,
  }) : [];

  const playerAbove = userStats && leaderboard.find(p => p.rank === userStats.rank - 1);
  const playerBelow = userStats && leaderboard.find(p => p.rank === userStats.rank + 1);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Predictions Section */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 px-1">Make Your Predictions</h2>
        {openFixtures.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-sm md:text-base">No matches available for predictions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {openFixtures.map((fixture) => (
              <PredictionCard
                key={fixture.id}
                fixture={fixture}
                existingPrediction={predictions.find((p) => p.fixtureId === fixture.id)}
                onPredict={onPredict}
              />
            ))}
          </div>
        )}
      </div>

      {/* Your Stats Section */}
      {userStats && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 px-1">Your Performance</h2>

          {/* Leaderboard Position */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Your Position</h3>
            <div className="space-y-2">
              {/* Player Above */}
              {playerAbove ? (
                <div className="flex items-center justify-between px-2 md:px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-semibold text-gray-600">#{playerAbove.rank}</span>
                    <span className="text-xs md:text-sm text-gray-700 truncate">{playerAbove.userName}</span>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-600">{playerAbove.totalPoints}</span>
                </div>
              ) : (
                <div className="px-3 py-2 text-center text-xs text-gray-400">
                  You're in 1st place!
                </div>
              )}

              {/* Current User */}
              <div className="flex items-center justify-between px-3 md:px-4 py-3 md:py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-2 md:gap-3">
                  <div>
                    {userStats.previousRank && userStats.previousRank > userStats.rank && (
                      <span className="text-green-600 text-lg md:text-xl">↑</span>
                    )}
                    {userStats.previousRank && userStats.previousRank < userStats.rank && (
                      <span className="text-red-600 text-lg md:text-xl">↓</span>
                    )}
                    {(!userStats.previousRank || userStats.previousRank === userStats.rank) && (
                      <span className="text-gray-400 text-lg md:text-xl">→</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-orange-600">#{userStats.rank}</div>
                    <div className="text-xs text-gray-600">You</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold text-orange-600">{userStats.totalPoints}</div>
                  <div className="text-xs text-gray-600">points</div>
                </div>
              </div>

              {/* Player Below */}
              {playerBelow ? (
                <div className="flex items-center justify-between px-2 md:px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-semibold text-gray-600">#{playerBelow.rank}</span>
                    <span className="text-xs md:text-sm text-gray-700 truncate">{playerBelow.userName}</span>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-600">{playerBelow.totalPoints}</span>
                </div>
              ) : (
                <div className="px-3 py-2 text-center text-xs text-gray-400">
                  You're in last place
                </div>
              )}
            </div>
          </div>

          {/* Accuracy Stats */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Accuracy</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Overall</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">{avgPoints}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Avg pts/match</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Your Badges</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`${badge.color} text-white p-3 md:p-4 rounded-xl text-center`}
                  >
                    <div className="text-2xl md:text-3xl mb-1 md:mb-2">{badge.emoji}</div>
                    <div className="font-bold text-xs md:text-sm">{badge.name}</div>
                    <div className="text-xs opacity-90 mt-1 hidden md:block">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg text-center">
              <p className="text-sm md:text-base text-gray-600">Keep predicting to earn badges!</p>
            </div>
          )}
        </div>
      )}

      {!userStats && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg text-center">
          <p className="text-sm md:text-base text-gray-500">Make your first prediction to see your stats!</p>
        </div>
      )}
    </div>
  );
}
