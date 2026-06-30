'use client';

import { useState, useEffect } from 'react';
import { Fixture, PointsRule, MatchStage, MatchStatus, PredictionResult } from '@/types';

export default function AdminPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fixturesRes, pointsRes, leaderboardRes] = await Promise.all([
        fetch('/api/fixtures'),
        fetch('/api/admin/points'),
        fetch('/api/leaderboard'),
      ]);

      const fixturesData = await fixturesRes.json();
      const pointsData = await pointsRes.json();
      const leaderboardData = await leaderboardRes.json();

      setFixtures(fixturesData);
      setPointsRules(pointsData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const copyLeaderboard = () => {
    const text = leaderboard
      .map((entry: any) => {
        const movement =
          !entry.previousRank ? '→' :
          entry.previousRank > entry.rank ? '↑' :
          entry.previousRank < entry.rank ? '↓' : '→';
        const trophy = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
        return `${entry.rank}. ${movement} ${trophy} ${entry.userName} - ${entry.totalPoints} pts ${entry.pointsChange > 0 ? `(+${entry.pointsChange})` : ''}`;
      })
      .join('\n');

    const fullText = `🏆 LEADERBOARD - FIFA 2026 🏆\n${new Date().toLocaleDateString()}\n\n${text}`;

    navigator.clipboard.writeText(fullText);
    alert('Leaderboard copied to clipboard!');
  };

  const handleUpdateFixture = async (
    fixtureId: string,
    updates: Partial<Fixture>
  ) => {
    try {
      const response = await fetch('/api/admin/fixtures', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fixtureId, ...updates }),
      });

      const updated = await response.json();
      setFixtures((prev) =>
        prev.map((f) => (f.id === fixtureId ? updated : f))
      );
      setSelectedFixture(null);
      alert('Fixture updated successfully!');
    } catch (error) {
      console.error('Failed to update fixture:', error);
      alert('Failed to update fixture');
    }
  };

  const handleUpdatePointsRule = async (
    stage: string,
    updates: Partial<PointsRule>
  ) => {
    try {
      const response = await fetch('/api/admin/points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, ...updates }),
      });

      const updated = await response.json();
      setPointsRules((prev) =>
        prev.map((r) => (r.stage === stage ? updated : r))
      );
      alert('Points rule updated successfully!');
    } catch (error) {
      console.error('Failed to update points rule:', error);
      alert('Failed to update points rule');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔧 Admin Dashboard</h1>
          <a
            href="/"
            className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
          >
            Back to App
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/admin/teams"
              className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg text-center"
            >
              <div className="text-3xl mb-2">🏴</div>
              <div className="font-bold text-lg">Manage Teams</div>
              <div className="text-sm text-indigo-100 mt-1">Add, edit teams with flags</div>
            </a>
            <a
              href="/admin/fixtures"
              className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg text-center"
            >
              <div className="text-3xl mb-2">⚽</div>
              <div className="font-bold text-lg">Manage Fixtures</div>
              <div className="text-sm text-blue-100 mt-1">Create, edit, delete matches</div>
            </a>
            <a
              href="/admin/participants"
              className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition shadow-lg text-center"
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="font-bold text-lg">Manage Participants</div>
              <div className="text-sm text-pink-100 mt-1">Edit users, adjust points</div>
            </a>
            <button
              onClick={() => {
                const section = document.getElementById('points-rules');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-lg text-center"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-bold text-lg">Points Rules</div>
              <div className="text-sm text-purple-100 mt-1">Adjust scoring system</div>
            </button>
            <button
              onClick={copyLeaderboard}
              className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition shadow-lg text-center"
            >
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-bold text-lg">Copy Leaderboard</div>
              <div className="text-sm text-yellow-100 mt-1">Share to WhatsApp</div>
            </button>
            <button
              onClick={() => {
                const section = document.getElementById('results');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-lg">Match Results</div>
              <div className="text-sm text-green-100 mt-1">Update scores quickly</div>
            </button>
          </div>
        </section>

        <section id="points-rules" className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Points Rules</h2>
          <button
            onClick={() => setIsEditingPoints(!isEditingPoints)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {isEditingPoints ? 'Done Editing' : 'Edit Points'}
          </button>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Stage</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Result Points</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Score Points</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Goal Scorer Points</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pointsRules.map((rule) => (
                  <tr key={rule.stage}>
                    <td className="px-4 py-3 capitalize text-gray-900">{rule.stage.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      {isEditingPoints ? (
                        <input
                          type="number"
                          value={rule.resultPoints}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            handleUpdatePointsRule(rule.stage, {
                              resultPoints: newValue,
                            });
                          }}
                          className="w-20 px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        <span className="text-gray-900">{rule.resultPoints}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditingPoints ? (
                        <input
                          type="number"
                          value={rule.scorePoints}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            handleUpdatePointsRule(rule.stage, {
                              scorePoints: newValue,
                            });
                          }}
                          className="w-20 px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        <span className="text-gray-900">{rule.scorePoints}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditingPoints ? (
                        <input
                          type="number"
                          value={rule.goalScorerPoints}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            handleUpdatePointsRule(rule.stage, {
                              goalScorerPoints: newValue,
                            });
                          }}
                          className="w-20 px-2 py-1 border rounded text-gray-900"
                        />
                      ) : (
                        <span className="text-gray-900">{rule.goalScorerPoints}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="results" className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Match Results</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click on a fixture to update its status, result, or scores. For full fixture management (create/edit/delete), use the <a href="/admin/fixtures" className="text-blue-600 hover:underline font-semibold">Manage Fixtures</a> page.
          </p>

          <div className="space-y-4">
            {fixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer"
                onClick={() => setSelectedFixture(fixture)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl">{fixture.teamAFlag}</span>
                    <span className="font-semibold text-gray-800">{fixture.teamA}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="text-2xl">{fixture.teamBFlag}</span>
                    <span className="font-semibold text-gray-800">{fixture.teamB}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      fixture.status === 'open'
                        ? 'bg-blue-100 text-blue-800'
                        : fixture.status === 'locked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {fixture.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(fixture.matchDate).toLocaleString()} • {fixture.stage}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedFixture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Edit Fixture
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match
                </label>
                <p className="text-gray-900">
                  {selectedFixture.teamAFlag} {selectedFixture.teamA} vs{' '}
                  {selectedFixture.teamBFlag} {selectedFixture.teamB}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedFixture.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as MatchStatus;
                    setSelectedFixture({ ...selectedFixture, status: newStatus });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                >
                  <option value="locked">Locked</option>
                  <option value="open">Open</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {selectedFixture.status === 'completed' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Result
                    </label>
                    <select
                      value={selectedFixture.result || ''}
                      onChange={(e) => {
                        const newResult = e.target.value as PredictionResult;
                        setSelectedFixture({ ...selectedFixture, result: newResult });
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    >
                      <option value="">Select winner</option>
                      <option value="teamA">{selectedFixture.teamA}</option>
                      <option value="draw">Draw</option>
                      <option value="teamB">{selectedFixture.teamB}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score
                    </label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="number"
                        min="0"
                        value={selectedFixture.scoreA || ''}
                        onChange={(e) =>
                          setSelectedFixture({
                            ...selectedFixture,
                            scoreA: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={selectedFixture.teamA}
                        className="flex-1 px-3 py-2 border rounded-lg text-gray-900"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedFixture.scoreB || ''}
                        onChange={(e) =>
                          setSelectedFixture({
                            ...selectedFixture,
                            scoreB: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={selectedFixture.teamB}
                        className="flex-1 px-3 py-2 border rounded-lg text-gray-900"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleUpdateFixture(selectedFixture.id, {
                      status: selectedFixture.status,
                      result: selectedFixture.result,
                      scoreA: selectedFixture.scoreA,
                      scoreB: selectedFixture.scoreB,
                    });
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setSelectedFixture(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
