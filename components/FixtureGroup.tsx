'use client';

import FixtureCard from './FixtureCard';
import { Fixture, Prediction, PredictionResult } from '@/types';

interface FixtureGroupProps {
  groupName: string;
  fixtures: Fixture[];
  predictions: Prediction[];
  onPredict: (
    fixtureId: string,
    prediction: PredictionResult,
    scoreA?: number,
    scoreB?: number,
    goalScorers?: string[]
  ) => Promise<void>;
}

export default function FixtureGroup({
  groupName,
  fixtures,
  predictions,
  onPredict,
}: FixtureGroupProps) {
  if (fixtures.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="stage-header">
        {groupName}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {fixtures.map((fixture) => (
          <FixtureCard
            key={fixture.id}
            fixture={fixture}
          />
        ))}
      </div>
    </div>
  );
}
