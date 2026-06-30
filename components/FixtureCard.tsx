'use client';

import { Fixture } from '@/types';

interface FixtureCardProps {
  fixture: Fixture;
}

export default function FixtureCard({ fixture }: FixtureCardProps) {
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

  const getStatusBadge = () => {
    switch (fixture.status) {
      case 'open':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            🔓 OPEN
          </span>
        );
      case 'locked':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            🔒 LOCKED
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            ✅ COMPLETED
          </span>
        );
    }
  };

  const getCardStyles = () => {
    switch (fixture.status) {
      case 'open':
        return {
          card: 'bg-gradient-to-br from-green-50 to-teal-50 border-green-300 hover:border-green-400',
          header: 'bg-green-100 border-green-200',
          dateText: 'text-green-800',
        };
      case 'locked':
        return {
          card: 'bg-gray-100 border-gray-300 opacity-60',
          header: 'bg-gray-200 border-gray-300',
          dateText: 'text-gray-500',
        };
      case 'completed':
        return {
          card: 'bg-white border-gray-100 hover:border-blue-300',
          header: 'bg-gray-50 border-gray-200',
          dateText: 'text-gray-600',
        };
      default:
        return {
          card: 'bg-white border-gray-100',
          header: 'bg-gray-50 border-gray-200',
          dateText: 'text-gray-600',
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div className={`rounded-lg shadow-md overflow-hidden border-2 transition-all ${styles.card}`}>
      {/* Status Badge */}
      <div className={`p-4 border-b flex justify-between items-center ${styles.header}`}>
        <div className={`text-xs font-medium ${styles.dateText}`}>
          {formatDate(fixture.matchDate)}
        </div>
        {getStatusBadge()}
      </div>

      {/* Team Names */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">{fixture.teamAFlag}</div>
            <div className={`font-bold text-sm ${fixture.status === 'locked' ? 'text-gray-500' : 'text-gray-800'}`}>
              {fixture.teamA}
            </div>
          </div>

          <div className="text-center px-4">
            {fixture.status === 'completed' && fixture.scoreA !== undefined && fixture.scoreB !== undefined ? (
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {fixture.scoreA} - {fixture.scoreB}
                </div>
                <div className="text-xs text-gray-500 mt-1">Final Score</div>
              </div>
            ) : (
              <div className={`text-2xl font-bold ${fixture.status === 'locked' ? 'text-gray-400' : 'text-gray-400'}`}>
                VS
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">{fixture.teamBFlag}</div>
            <div className={`font-bold text-sm ${fixture.status === 'locked' ? 'text-gray-500' : 'text-gray-800'}`}>
              {fixture.teamB}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
