'use client';

import { Fixture, Prediction } from '@/types';

interface ResultsTabProps {
  fixtures: Fixture[];
  predictions: Prediction[];
}

export default function ResultsTab({ fixtures, predictions }: ResultsTabProps) {
  const completedFixtures = fixtures
    .filter(f => f.status === 'completed' && f.result)
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

  if (completedFixtures.length === 0) {
    return (
      <div className="p-8 text-center pb-20">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500">No completed matches yet</p>
      </div>
    );
  }

  const getResultText = (fixture: Fixture) => {
    if (fixture.result === 'teamA') return `${fixture.teamA} Won`;
    if (fixture.result === 'teamB') return `${fixture.teamB} Won`;
    return 'Draw';
  };

  const getUserPrediction = (fixtureId: string) => {
    return predictions.find(p => p.fixtureId === fixtureId);
  };

  const getPredictionText = (prediction: Prediction | undefined, fixture: Fixture) => {
    if (!prediction) return 'No prediction';

    if (prediction.prediction === 'teamA') return `${fixture.teamA} Win`;
    if (prediction.prediction === 'teamB') return `${fixture.teamB} Win`;
    return 'Draw';
  };

  const wasCorrect = (prediction: Prediction | undefined, fixture: Fixture) => {
    if (!prediction) return false;
    return prediction.prediction === fixture.result;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">📊 Match Results</h2>
        <p className="text-green-100">{completedFixtures.length} matches completed</p>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {completedFixtures.map((fixture) => {
          const prediction = getUserPrediction(fixture.id);
          const correct = wasCorrect(prediction, fixture);
          const points = prediction?.pointsEarned || 0;

          return (
            <div key={fixture.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Match Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{fixture.teamAFlag}</span>
                    <span className="font-bold text-lg">{fixture.teamA}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {fixture.scoreA} - {fixture.scoreB}
                    </div>
                    <div className="text-xs text-blue-100">FINAL</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{fixture.teamB}</span>
                    <span className="text-3xl">{fixture.teamBFlag}</span>
                  </div>
                </div>
                <div className="text-center text-sm text-blue-100 mt-2">
                  {getResultText(fixture)}
                </div>
              </div>

              {/* Your Prediction */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Your Prediction</div>
                    <div className="font-semibold text-gray-800">
                      {getPredictionText(prediction, fixture)}
                      {prediction?.scoreA !== undefined && ` ${prediction.scoreA}-${prediction.scoreB}`}
                    </div>
                  </div>
                  <div className={`text-right ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    {correct ? (
                      <>
                        <div className="text-2xl font-bold">✅ +{points}</div>
                        <div className="text-xs">Correct!</div>
                      </>
                    ) : prediction ? (
                      <>
                        <div className="text-2xl font-bold">❌ 0</div>
                        <div className="text-xs">Incorrect</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-400">—</div>
                        <div className="text-xs text-gray-400">No prediction</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {formatDate(fixture.matchDate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
