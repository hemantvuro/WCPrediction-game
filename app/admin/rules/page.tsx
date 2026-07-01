'use client';

import { useState, useEffect } from 'react';
import { PointsRule } from '@/types';

export default function RulesManagement() {
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await fetch('/api/admin/points');
      if (!response.ok) {
        throw new Error(`Failed to load rules: ${response.status}`);
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        setError('No points rules found. Please run the CREATE_POINTS_RULES.sql script in Supabase.');
      } else {
        setPointsRules(data);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
      setError('Failed to load rules. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRule = async (stage: string, field: 'resultPoints' | 'scorePoints' | 'goalScorerPoints', value: number) => {
    try {
      const response = await fetch('/api/admin/points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          [field]: value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update rule');
      }

      await loadRules();
    } catch (error) {
      console.error('Failed to update rule:', error);
      alert(`Failed to update rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStageName = (stage: string) => {
    const names: Record<string, string> = {
      group: 'Group Stage',
      round32: 'Round of 32',
      round16: 'Round of 16',
      quarter: 'Quarter Finals',
      semi: 'Semi Finals',
      third_place: 'Third Place Match',
      final: 'Final',
    };
    return names[stage] || stage;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fifa-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Points Rules</h1>
            <a
              href="/"
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30"
            >
              ← Back
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ Setup Required</h3>
            <p className="text-red-800 mb-4">{error}</p>
            <div className="bg-white rounded p-4 border border-red-200">
              <p className="text-sm font-bold text-red-900 mb-2">To fix this:</p>
              <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                <li>Go to Supabase SQL Editor</li>
                <li>Run the SQL from <code className="bg-red-100 px-2 py-1 rounded">CREATE_POINTS_RULES.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Prediction Points System</h2>
              <p className="text-gray-600 mt-1">
                Configure how many points are awarded for correct predictions at each stage
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isEditing
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'fifa-gradient text-white hover:opacity-90'
              }`}
            >
              {isEditing ? '✓ Done Editing' : '✏️ Edit Rules'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">How Points Work:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Result Points:</strong> Awarded for correctly predicting the winner or draw</li>
              <li>• <strong>Score Points:</strong> Awarded for predicting the exact score (e.g., 2-1)</li>
              <li>• <strong>Goal Scorer Points:</strong> Awarded for each correct goal scorer prediction (Semi finals onwards)</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Stage</th>
                  <th className="px-6 py-4 text-center font-bold">Result Points</th>
                  <th className="px-6 py-4 text-center font-bold">Score Points</th>
                  <th className="px-6 py-4 text-center font-bold">Goal Scorer Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pointsRules.map((rule, index) => (
                  <tr
                    key={rule.stage}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {rule.stage === 'final' ? '🏆' :
                           rule.stage === 'semi' ? '🥇' :
                           rule.stage === 'third_place' ? '🥉' :
                           rule.stage === 'quarter' ? '⚡' :
                           rule.stage.includes('round') ? '🎯' :
                           '⚽'}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {getStageName(rule.stage)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={rule.resultPoints}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            handleUpdateRule(rule.stage, 'resultPoints', newValue);
                          }}
                          className="w-20 px-3 py-2 border-2 border-blue-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-bold text-lg">
                          {rule.resultPoints}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={rule.scorePoints}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            handleUpdateRule(rule.stage, 'scorePoints', newValue);
                          }}
                          className="w-20 px-3 py-2 border-2 border-green-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-900 rounded-lg font-bold text-lg">
                          {rule.scorePoints}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={rule.goalScorerPoints}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            handleUpdateRule(rule.stage, 'goalScorerPoints', newValue);
                          }}
                          className="w-20 px-3 py-2 border-2 border-yellow-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-yellow-500"
                        />
                      ) : (
                        <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-bold text-lg">
                          {rule.goalScorerPoints}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 text-lg mb-3">📊 Example Calculation</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-semibold">Match: Brazil 3-1 Argentina (Final)</p>
              <p>User predicted: Brazil 3-1, Neymar scored</p>
              <hr className="border-blue-300 my-2" />
              <p>✅ Result: {pointsRules.find(r => r.stage === 'final')?.resultPoints || 2} pts (correct winner)</p>
              <p>✅ Score: {pointsRules.find(r => r.stage === 'final')?.scorePoints || 2} pts (exact match)</p>
              <p>✅ Scorer: {pointsRules.find(r => r.stage === 'final')?.goalScorerPoints || 1} pt (Neymar correct)</p>
              <p className="font-bold text-blue-900 text-lg mt-2">
                Total: {
                  (pointsRules.find(r => r.stage === 'final')?.resultPoints || 2) +
                  (pointsRules.find(r => r.stage === 'final')?.scorePoints || 2) +
                  (pointsRules.find(r => r.stage === 'final')?.goalScorerPoints || 1)
                } points
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 text-lg mb-3">💡 Tips for Setting Points</h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Higher stakes = Higher points (e.g., Finals worth more)</li>
              <li>• Exact score is harder, so consider higher points</li>
              <li>• Goal scorers add extra challenge for key matches</li>
              <li>• Keep group stage lower to build excitement</li>
              <li>• Test with your group to find the right balance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Changes take effect immediately. All future matches will use the updated points.
            Past match points remain unchanged.
          </p>
        </div>
      </div>
    </div>
  );
}
