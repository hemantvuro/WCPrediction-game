'use client';

import { LeaderboardEntry } from '@/types';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { getBadges } from '@/lib/badges';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onExport?: () => void;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

export default function Leaderboard({ entries, onExport, onRefresh, lastUpdated }: LeaderboardProps) {
  const getMovementIcon = (entry: LeaderboardEntry) => {
    if (!entry.previousRank) {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }

    if (entry.previousRank > entry.rank) {
      return <ArrowUp className="w-4 h-4 text-green-600" />;
    }

    if (entry.previousRank < entry.rank) {
      return <ArrowDown className="w-4 h-4 text-red-600" />;
    }

    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    return 'bg-white border-gray-200 text-gray-900';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            Export
          </button>
        )}
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No predictions yet. Start predicting to see the leaderboard!
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.userId}
              className={`border-2 rounded-lg p-4 flex items-center gap-4 ${getRankColor(entry.rank)}`}
            >
              <div className="flex items-center gap-2 min-w-[60px]">
                <div className="text-2xl font-bold">
                  {entry.rank}
                </div>
                {getMovementIcon(entry)}
              </div>

              <div className="flex-1">
                <div className="font-semibold text-lg">{entry.userName}</div>
                {entry.pointsChange > 0 && (
                  <div className="text-sm text-green-600">+{entry.pointsChange} pts</div>
                )}
                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {getBadges({
                    rank: entry.rank,
                    totalPoints: entry.totalPoints,
                    correctPredictions: entry.correctPredictions || 0,
                    exactScores: entry.exactScores || 0,
                    pointsChange: entry.pointsChange || 0,
                  }).map((badge) => (
                    <span
                      key={badge.id}
                      className={`${badge.color} text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1`}
                      title={badge.description}
                    >
                      <span>{badge.emoji}</span>
                      <span>{badge.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">{entry.totalPoints}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
