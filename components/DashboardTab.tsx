'use client';

import { Fixture, Prediction, LeaderboardEntry, PredictionResult } from '@/types';
import PredictionCard from './PredictionCard';
import { getBadges } from '@/lib/badges';

interface DashboardTabProps {
  openFixtures: Fixture[];
  predictions: Prediction[];
  userStats: LeaderboardEntry | null;
  totalFixtures: number;
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

  return (
    <div className="space-y-6 pb-24">
      {/* Predictions Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Make Your Predictions</h2>
        {openFixtures.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">No matches available for predictions</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Your Performance</h2>

          {/* Leaderboard Position */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Position</h3>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
              <div>
                <div className="text-sm text-gray-600">Current Rank</div>
                <div className="text-4xl font-bold text-orange-600">#{userStats.rank}</div>
              </div>
              <div className="text-right">
                {userStats.previousRank && userStats.previousRank > userStats.rank && (
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <span className="text-2xl">↑</span>
                    <span>Up {userStats.previousRank - userStats.rank}</span>
                  </div>
                )}
                {userStats.previousRank && userStats.previousRank < userStats.rank && (
                  <div className="text-red-600 font-bold flex items-center gap-1">
                    <span className="text-2xl">↓</span>
                    <span>Down {userStats.rank - userStats.previousRank}</span>
                  </div>
                )}
                {(!userStats.previousRank || userStats.previousRank === userStats.rank) && (
                  <div className="text-gray-500 font-bold">
                    <span className="text-2xl">→</span> Same
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Correct Predictions</span>
                <span className="text-2xl font-bold text-green-600">{userStats.correctPredictions || 0}/{totalFixtures}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Exact Scores</span>
                <span className="text-2xl font-bold text-blue-600">{userStats.exactScores || 0}/{totalFixtures}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Points</span>
                <span className="text-2xl font-bold text-purple-600">{userStats.totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Accuracy Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Accuracy</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-600 mt-1">Overall</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{avgPoints}</div>
                <div className="text-sm text-gray-600 mt-1">Avg pts/match</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Your Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`${badge.color} text-white p-4 rounded-xl text-center`}
                  >
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <div className="font-bold text-sm">{badge.name}</div>
                    <div className="text-xs opacity-90 mt-1">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <p className="text-gray-600">Keep predicting to earn badges!</p>
            </div>
          )}
        </div>
      )}

      {!userStats && (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <p className="text-gray-500">Make your first prediction to see your stats!</p>
        </div>
      )}
    </div>
  );
}
