import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all predictions for this fixture
    const allPredictions = db.getAllPredictions();
    const fixturePredictions = allPredictions.filter(p => p.fixtureId === id);

    if (fixturePredictions.length === 0) {
      return NextResponse.json({
        total: 0,
        outcomes: { teamA: 0, teamB: 0, draw: 0 },
        scores: [],
        confidence: 'low'
      });
    }

    // Count outcomes
    const outcomes = {
      teamA: 0,
      teamB: 0,
      draw: 0
    };

    fixturePredictions.forEach(pred => {
      if (pred.prediction === 'teamA') outcomes.teamA++;
      else if (pred.prediction === 'teamB') outcomes.teamB++;
      else if (pred.prediction === 'draw') outcomes.draw++;
    });

    // Count scores
    const scoreMap = new Map<string, number>();
    fixturePredictions.forEach(pred => {
      if (pred.scoreA !== undefined && pred.scoreB !== undefined) {
        const key = `${pred.scoreA}-${pred.scoreB}`;
        scoreMap.set(key, (scoreMap.get(key) || 0) + 1);
      }
    });

    // Convert to array and sort by count
    const scores = Array.from(scoreMap.entries())
      .map(([score, count]) => {
        const [scoreA, scoreB] = score.split('-').map(Number);
        return { scoreA, scoreB, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 scores

    // Calculate confidence level
    const total = fixturePredictions.length;
    const maxOutcome = Math.max(outcomes.teamA, outcomes.teamB, outcomes.draw);
    const maxPercentage = (maxOutcome / total) * 100;

    let confidence: 'high' | 'medium' | 'low';
    if (maxPercentage >= 60) confidence = 'high';
    else if (maxPercentage >= 40) confidence = 'medium';
    else confidence = 'low';

    return NextResponse.json({
      total,
      outcomes,
      scores,
      confidence
    });
  } catch (error) {
    console.error('Failed to get fixture stats:', error);
    return NextResponse.json({ error: 'Failed to get fixture stats' }, { status: 500 });
  }
}
