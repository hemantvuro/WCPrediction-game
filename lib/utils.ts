import { Fixture, MatchStage } from '@/types';

// Format date and time for India timezone (Asia/Kolkata) without showing timezone
export function formatMatchDateTime(date: Date): string {
  const indiaDate = new Date(date);

  return indiaDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Format just the date
export function formatMatchDate(date: Date): string {
  const indiaDate = new Date(date);

  return indiaDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get stage display name
export function getStageName(stage: MatchStage): string {
  const names: Record<MatchStage, string> = {
    group: 'Group Stage',
    round32: 'Round of 32',
    round16: 'Round of 16',
    quarter: 'Quarter Finals',
    semi: 'Semi Finals',
    third_place: 'Third Place Match',
    final: 'Final',
  };
  return names[stage];
}

// Group fixtures by stage and group
export function groupFixtures(fixtures: Fixture[]): Record<string, Fixture[]> {
  const grouped: Record<string, Fixture[]> = {};

  // Sort fixtures by date first
  const sorted = [...fixtures].sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
  );

  for (const fixture of sorted) {
    let key: string;

    if (fixture.stage === 'group' && fixture.group) {
      key = `Group ${fixture.group}`;
    } else {
      key = getStageName(fixture.stage);
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(fixture);
  }

  return grouped;
}

// Get group order for display (FIFA 2026: 12 groups A-L!)
export function getGroupOrder(): string[] {
  return [
    'Group A',
    'Group B',
    'Group C',
    'Group D',
    'Group E',
    'Group F',
    'Group G',
    'Group H',
    'Group I',
    'Group J',
    'Group K',
    'Group L',
    'Round of 32',
    'Round of 16',
    'Quarter Finals',
    'Semi Finals',
    'Third Place Match',
    'Final',
  ];
}

// Check if fixture is in knockout stage
export function isKnockoutStage(stage: MatchStage): boolean {
  return ['round32', 'round16', 'quarter', 'semi', 'third_place', 'final'].includes(stage);
}
