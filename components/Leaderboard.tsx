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
  // Filter out test users and recalculate ranks
  const filteredEntries = entries
    .filter(entry => !['test', 'germanjit'].includes(entry.userName.toLowerCase()))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1, // Recalculate rank starting from 1
    }));

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
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs md:text-sm font-medium"
          >
            Export
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-lg p-6 md:p-8 text-center text-sm md:text-base text-gray-500">
            No predictions yet. Start predicting to see the leaderboard!
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.userId}
              className={`border-2 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-4 ${getRankColor(entry.rank)} transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300`}
            >
              <div className="flex items-center gap-1.5 md:gap-2 min-w-[50px] md:min-w-[60px]">
                <div className="text-xl md:text-2xl font-bold">
                  {entry.rank}
                </div>
                {getMovementIcon(entry)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base md:text-lg truncate">{entry.userName}</div>
                {entry.pointsChange > 0 && (
                  <div className="text-xs md:text-sm text-green-600">+{entry.pointsChange} pts</div>
                )}
                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-1 md:mt-2">
                  {getBadges({
                    rank: entry.rank,
                    totalPoints: entry.totalPoints,
                    correctPredictions: entry.correctPredictions || 0,
                    exactScores: entry.exactScores || 0,
                    pointsChange: entry.pointsChange || 0,
                  }).map((badge) => (
                    <span
                      key={badge.id}
                      className={`${badge.color} text-white text-xs px-2 py-0.5 md:py-1 rounded-full font-semibold flex items-center gap-1`}
                      title={badge.description}
                    >
                      <span className="hidden md:inline">{badge.emoji}</span>
                      <span>{badge.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xl md:text-2xl font-bold">{entry.totalPoints}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
