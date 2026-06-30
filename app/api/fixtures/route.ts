import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { updateFixtureStatuses } from '@/lib/fixture-utils';
import { syncFixtures } from '@/lib/football-data-api';

let autoSyncAttempted = false;

export async function GET() {
  try {
    let fixtures = await db.getAllFixtures();

    // Auto-sync fixtures from API on first load if database is empty
    if (fixtures.length === 0 && !autoSyncAttempted) {
      autoSyncAttempted = true;
      console.log('🔄 Database empty, auto-syncing fixtures from API...');

      try {
        const apiFixtures = await syncFixtures(2000); // World Cup 2022

        for (const fixtureData of apiFixtures) {
          await db.createFixture(fixtureData);
        }

        fixtures = await db.getAllFixtures();
        console.log(`✅ Auto-synced ${fixtures.length} fixtures from API`);
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
        console.log('💡 Please use Admin → Fixture Management → Sync from API to load fixtures manually');
      }
    }

    // Auto-update fixture statuses based on current time
    fixtures = updateFixtureStatuses(fixtures);

    // Save updated statuses back to database
    await Promise.all(fixtures.map(fixture =>
      db.updateFixture(fixture.id, { status: fixture.status })
    ));

    return NextResponse.json(fixtures);
  } catch (error) {
    console.error('Error in GET /api/fixtures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}
