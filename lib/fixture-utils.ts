import { Fixture } from '@/types';

/**
 * Get the appropriate status for a fixture based on current time
 * - Past matches (>2 hours ago): 'completed'
 * - Next 24 hours: 'open'
 * - Future matches: 'locked'
 */
export function getFixtureStatus(matchDate: Date): 'open' | 'locked' | 'completed' {
  const now = new Date();
  const matchTime = new Date(matchDate);
  const hoursDiff = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Past matches (more than 2 hours ago) are completed
  if (hoursDiff < -2) {
    return 'completed';
  }

  // Matches in next 24 hours are open for prediction
  if (hoursDiff >= -2 && hoursDiff <= 24) {
    return 'open';
  }

  // Future matches are locked
  return 'locked';
}

/**
 * Update fixture statuses based on current time
 */
export function updateFixtureStatuses(fixtures: Fixture[]): Fixture[] {
  return fixtures.map(fixture => {
    // Don't change status of completed matches with scores
    if (fixture.status === 'completed' && fixture.scoreA !== undefined && fixture.scoreB !== undefined) {
      return fixture;
    }

    const autoStatus = getFixtureStatus(fixture.matchDate);
    return {
      ...fixture,
      status: autoStatus
    };
  });
}

/**
 * Check if a fixture is eligible for prediction
 */
export function canPredict(fixture: Fixture): boolean {
  const status = getFixtureStatus(fixture.matchDate);
  return status === 'open' && fixture.status !== 'completed';
}

/**
 * Format match result display
 */
export function formatMatchResult(fixture: Fixture): string {
  if (fixture.scoreA === undefined || fixture.scoreB === undefined) {
    return 'vs';
  }
  return `${fixture.scoreA} - ${fixture.scoreB}`;
}
