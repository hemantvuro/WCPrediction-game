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
  const [scoreA, setScoreA] = useState<string>('0');
  const [scoreB, setScoreB] = useState<string>('0');
  const [countdown, setCountdown] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stats, setStats] = useState<FixtureStats | null>(null);

  const isGroupStage = fixture.stage === 'group';
  const enableMatchOutcome = fixture.enableMatchOutcome !== false;
  const enableScorePrediction = fixture.enableScorePrediction !== false;

  useEffect(() => {
    if (existingPrediction) {
      setSelectedOutcome(existingPrediction.prediction);
      setScoreA(existingPrediction.scoreA?.toString() || '0');
      setScoreB(existingPrediction.scoreB?.toString() || '0');
    }
  }, [existingPrediction?.id, existingPrediction?.prediction, existingPrediction?.scoreA, existingPrediction?.scoreB]);

  useEffect(() => {
    if (!isExpired) {
      fetchStats();
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

  useEffect(() => {
    if (isExpired) return;
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedOutcome, scoreA, scoreB, isExpired]);

  const handleAutoSave = async () => {
    if (isSaving) return;

    let prediction: PredictionResult | null = null;
    let scoreANum: number | undefined = undefined;
    let scoreBNum: number | undefined = undefined;

    if (enableScorePrediction && scoreA !== '' && scoreB !== '') {
      scoreANum = parseInt(scoreA);
      scoreBNum = parseInt(scoreB);

      if (isNaN(scoreANum) || isNaN(scoreBNum)) {
        return;
      }
    }

    if (enableMatchOutcome && selectedOutcome) {
      prediction = selectedOutcome;
    } else if (scoreANum !== undefined && scoreBNum !== undefined) {
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
      await onPredict(fixture.id, prediction, scoreANum, scoreBNum, undefined);
      setSaveError(null);
    } catch (error) {
      setSaveError('Failed to save prediction. This fixture may be closed.');
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="text-sm text-gray-700 text-center font-medium">
          {formatDate(fixture.matchDate)}
        </div>
        <div className={`text-xs text-center mt-1 font-semibold ${
          isExpired ? 'text-red-600' : 'text-orange-600'
        }`}>
          {countdown}
        </div>
      </div>

      {/* Teams and Prediction */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 md:mb-6">
          <button
            onClick={() => !isExpired && setSelectedOutcome('teamA')}
            disabled={isExpired}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow transform hover:scale-105 active:scale-95 ${
              selectedOutcome === 'teamA'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-blue-400'
            } disabled:opacity-50 disabled:hover:scale-100`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{fixture.teamAFlag}</span>
              <span className="truncate">{fixture.teamA}</span>
            </div>
          </button>

          <div className="text-gray-400 font-bold text-xs">VS</div>

          <button
            onClick={() => !isExpired && setSelectedOutcome('teamB')}
            disabled={isExpired}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow transform hover:scale-105 active:scale-95 ${
              selectedOutcome === 'teamB'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-400'
            } disabled:opacity-50 disabled:hover:scale-100`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{fixture.teamBFlag}</span>
              <span className="truncate">{fixture.teamB}</span>
            </div>
          </button>
        </div>

        {/* Score Inputs */}
        {enableScorePrediction && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1 text-center">Score</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                disabled={isExpired}
                className="w-16 px-2 py-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-all duration-200 hover:border-blue-400"
              />
            </div>
            <div className="mt-5 text-gray-400 font-bold">-</div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 text-center">Score</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                disabled={isExpired}
                className="w-16 px-2 py-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 transition-all duration-200 hover:border-purple-400"
              />
            </div>
          </div>
        )}

        {/* Status */}
        {existingPrediction && !isExpired && !saveError && (
          <div className="text-xs text-center text-green-600 font-semibold">
            {isSaving ? 'Saving...' : 'Saved'}
          </div>
        )}
        {saveError && !isExpired && (
          <div className="text-xs text-center text-red-600 font-semibold">
            {saveError}
          </div>
        )}
      </div>

      {/* Other Players' Predictions */}
      {stats && stats.total > 0 && !isExpired && (
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">
              Other Players ({stats.total})
            </div>

            {/* Outcome Breakdown */}
            {enableMatchOutcome && (
              <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
                {stats.outcomes.teamA > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm px-1 md:px-2 py-1">
                    <span className="text-gray-700 truncate">{fixture.teamAFlag} {fixture.teamA}</span>
                    <span className="font-bold text-blue-600 ml-2">{((stats.outcomes.teamA / stats.total) * 100).toFixed(0)}%</span>
                  </div>
                )}
                {stats.outcomes.draw > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm px-1 md:px-2 py-1">
                    <span className="text-gray-700">Draw</span>
                    <span className="font-bold text-gray-600">{((stats.outcomes.draw / stats.total) * 100).toFixed(0)}%</span>
                  </div>
                )}
                {stats.outcomes.teamB > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm px-1 md:px-2 py-1">
                    <span className="text-gray-700 truncate">{fixture.teamBFlag} {fixture.teamB}</span>
                    <span className="font-bold text-purple-600 ml-2">{((stats.outcomes.teamB / stats.total) * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Popular Scores */}
            {enableScorePrediction && stats.scores.length > 0 && (
              <div>
                <div className="text-xs md:text-sm font-semibold text-gray-600 mb-1.5 md:mb-2">Popular Scores</div>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {stats.scores.slice(0, 3).map((score, idx) => (
                    <div key={idx} className="text-xs md:text-sm bg-white rounded-lg px-2 md:px-3 py-1 md:py-1.5 border border-gray-300">
                      <span className="font-bold text-gray-800">{score.scoreA}-{score.scoreB}</span>
                      <span className="text-gray-500 ml-1">({score.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
