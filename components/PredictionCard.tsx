'use client';

import { useState, useEffect } from 'react';
import { Fixture, PredictionResult, Prediction } from '@/types';

interface PredictionCardProps {
  fixture: Fixture;
  existingPrediction?: Prediction;
  onPredict: (fixtureId: string, prediction: PredictionResult, scoreA?: number, scoreB?: number, goalScorers?: string[]) => Promise<void>;
}

export default function PredictionCard({ fixture, existingPrediction, onPredict }: PredictionCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<PredictionResult | null>(null);
  const [scoreA, setScoreA] = useState<string>('0');
  const [scoreB, setScoreB] = useState<string>('0');
  const [countdown, setCountdown] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="p-3 border-b bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          {formatDate(fixture.matchDate)}
        </div>
        <div className={`text-xs text-center mt-1 font-semibold ${
          isExpired ? 'text-red-600' : 'text-orange-600'
        }`}>
          {countdown}
        </div>
      </div>

      {/* Teams and Prediction */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => !isExpired && setSelectedOutcome('teamA')}
            disabled={isExpired}
            className={`flex-1 py-3 px-2 rounded border-2 font-semibold text-sm transition ${
              selectedOutcome === 'teamA'
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            } disabled:opacity-50`}
          >
            <div className="text-xl mb-1">{fixture.teamAFlag}</div>
            <div className="text-xs">{fixture.teamA}</div>
          </button>

          <div className="text-gray-400 font-bold">VS</div>

          <button
            onClick={() => !isExpired && setSelectedOutcome('teamB')}
            disabled={isExpired}
            className={`flex-1 py-3 px-2 rounded border-2 font-semibold text-sm transition ${
              selectedOutcome === 'teamB'
                ? 'bg-purple-500 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            } disabled:opacity-50`}
          >
            <div className="text-xl mb-1">{fixture.teamBFlag}</div>
            <div className="text-xs">{fixture.teamB}</div>
          </button>
        </div>

        {/* Score Inputs */}
        {enableScorePrediction && (
          <div className="flex items-center justify-center gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Score</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                disabled={isExpired}
                className="w-14 px-2 py-1.5 border rounded text-center font-bold focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div className="mt-5 text-gray-400 font-bold">-</div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Score</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                disabled={isExpired}
                className="w-14 px-2 py-1.5 border rounded text-center font-bold focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="px-4 pb-3">
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
    </div>
  );
}
