'use client';

import { useState, useEffect } from 'react';
import { User, Fixture, Prediction } from '@/types';

interface PredictionRecord {
  user: User;
  fixture: Fixture;
  prediction?: Prediction;
}

export default function PlayerPredictionsPage() {
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    // Set default to previous day in India timezone
    const indiaOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const indiaTime = new Date(now.getTime() + indiaOffset);
    const yesterday = new Date(indiaTime);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setSelectedDate(yesterdayStr);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadPredictions();
    }
  }, [selectedDate]);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      // Fetch all data
      const [usersRes, fixturesRes, predictionsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/fixtures'),
        fetch('/api/predictions'),
      ]);

      const users: User[] = await usersRes.json();
      const allFixtures: Fixture[] = await fixturesRes.json();
      const allPredictions: Prediction[] = await predictionsRes.json();

      // Filter fixtures that were open on the selected date
      const targetDate = new Date(selectedDate);
      const targetStart = new Date(targetDate);
      targetStart.setHours(0, 0, 0, 0);
      const targetEnd = new Date(targetDate);
      targetEnd.setHours(23, 59, 59, 999);

      const targetFixtures = allFixtures.filter((f) => {
        const matchDate = new Date(f.matchDate);
        // Fixtures that were scheduled for the target date
        return matchDate >= targetStart && matchDate <= targetEnd;
      });

      console.log('Target date:', selectedDate);
      console.log('Fixtures on target date:', targetFixtures.length);

      // Create records for all users and fixtures
      const predictionRecords: PredictionRecord[] = [];

      users.forEach((user) => {
        targetFixtures.forEach((fixture) => {
          const prediction = allPredictions.find(
            (p) => p.userId === user.id && p.fixtureId === fixture.id
          );
          predictionRecords.push({
            user,
            fixture,
            prediction,
          });
        });
      });

      // Sort by fixture date, then by user name
      predictionRecords.sort((a, b) => {
        const dateA = new Date(a.fixture.matchDate).getTime();
        const dateB = new Date(b.fixture.matchDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.user.firstName.localeCompare(b.user.firstName);
      });

      setRecords(predictionRecords);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      alert('Failed to load predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPredictionText = (prediction?: Prediction, fixture?: Fixture) => {
    if (!prediction) return '—';

    let text = '';

    // Outcome
    if (prediction.prediction === 'teamA') {
      text += `${fixture?.teamA} Win`;
    } else if (prediction.prediction === 'teamB') {
      text += `${fixture?.teamB} Win`;
    } else if (prediction.prediction === 'draw') {
      text += 'Draw';
    }

    // Score
    if (prediction.scoreA !== undefined && prediction.scoreB !== undefined) {
      text += text ? ' | ' : '';
      text += `Score: ${prediction.scoreA}-${prediction.scoreB}`;
    }

    // Goal scorers
    if (prediction.goalScorers && prediction.goalScorers.length > 0) {
      text += text ? ' | ' : '';
      text += `Scorers: ${prediction.goalScorers.join(', ')}`;
    }

    return text || '—';
  };

  // Group records by fixture
  const groupedRecords: { [fixtureId: string]: PredictionRecord[] } = {};
  records.forEach((record) => {
    if (!groupedRecords[record.fixture.id]) {
      groupedRecords[record.fixture.id] = [];
    }
    groupedRecords[record.fixture.id].push(record);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fifa-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">📊 Player Predictions</h1>
              <p className="text-white/90">View predictions from previous days</p>
            </div>
            <a
              href="/"
              className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30"
            >
              ← Back
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Picker */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            Shows fixtures that were scheduled for the selected date
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-600">Loading predictions...</div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-600">No fixtures found for {selectedDate}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRecords).map(([fixtureId, fixtureRecords]) => {
              const fixture = fixtureRecords[0].fixture;
              return (
                <div key={fixtureId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Fixture Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{fixture.teamAFlag}</span>
                        <span className="font-bold">{fixture.teamA}</span>
                        <span className="text-white/80">vs</span>
                        <span className="font-bold">{fixture.teamB}</span>
                        <span className="text-2xl">{fixture.teamBFlag}</span>
                      </div>
                      <div className="text-sm text-white/90">
                        {formatDate(fixture.matchDate)}
                      </div>
                    </div>
                  </div>

                  {/* Predictions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Prediction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {fixtureRecords.map((record) => (
                          <tr
                            key={`${record.user.id}-${record.fixture.id}`}
                            className={record.prediction ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {record.user.firstName}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm ${record.prediction ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                {getPredictionText(record.prediction, record.fixture)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
                    Predictions: {fixtureRecords.filter((r) => r.prediction).length} / {fixtureRecords.length}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
