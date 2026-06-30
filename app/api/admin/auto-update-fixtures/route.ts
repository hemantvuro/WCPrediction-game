import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

/**
 * Auto-update fixture statuses based on current date/time
 *
 * Rules (India timezone - UTC+5:30):
 * - Open for Predictions: Tomorrow's matches until 1PM today
 * - Completed: Past matches (admin must manually enter scores)
 * - Upcoming: Future matches after tomorrow
 */
export async function POST() {
  try {
    console.log('Starting auto-update fixtures...');

    // Get current time in India timezone (UTC+5:30)
    const now = new Date();
    const indiaOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const indiaTime = new Date(now.getTime() + indiaOffset);

    console.log('Current India time:', indiaTime.toISOString());
    console.log('Current India date:', indiaTime.toDateString());

    // Calculate cutoff times
    const todayStart = new Date(indiaTime);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(indiaTime);
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const todayAt1PM = new Date(todayStart);
    todayAt1PM.setHours(13, 0, 0, 0); // 1PM today

    console.log('Today start:', todayStart.toISOString());
    console.log('Today 1PM:', todayAt1PM.toISOString());
    console.log('Tomorrow start:', tomorrowStart.toISOString());
    console.log('Tomorrow end:', tomorrowEnd.toISOString());

    // Get all fixtures
    const fixtures = await db.getAllFixtures();
    console.log(`Found ${fixtures.length} fixtures`);

    const updates = {
      openCount: 0,
      completedCount: 0,
      upcomingCount: 0,
    };

    for (const fixture of fixtures) {
      const matchDate = new Date(fixture.matchDate);
      let newStatus = fixture.status;

      // Rule 1: Past matches should be completed (if they have scores)
      if (matchDate < todayStart) {
        if (fixture.scoreA !== undefined && fixture.scoreB !== undefined) {
          newStatus = 'completed';
        } else {
          // Past matches without scores - keep as completed but flag for admin
          newStatus = 'completed';
        }
        if (fixture.status !== newStatus) {
          await db.updateFixture(fixture.id, { status: newStatus });
          updates.completedCount++;
        }
      }
      // Rule 2: Tomorrow's matches (if before 1PM today) should be OPEN
      else if (matchDate >= tomorrowStart && matchDate <= tomorrowEnd && indiaTime < todayAt1PM) {
        newStatus = 'open';
        if (fixture.status !== newStatus) {
          await db.updateFixture(fixture.id, { status: newStatus });
          updates.openCount++;
        }
      }
      // Rule 3: Tomorrow's matches (after 1PM today) should be LOCKED
      else if (matchDate >= tomorrowStart && matchDate <= tomorrowEnd && indiaTime >= todayAt1PM) {
        newStatus = 'locked';
        if (fixture.status !== newStatus) {
          await db.updateFixture(fixture.id, { status: newStatus });
          updates.upcomingCount++;
        }
      }
      // Rule 4: All other future matches should be LOCKED (upcoming)
      else if (matchDate > tomorrowEnd) {
        newStatus = 'locked';
        if (fixture.status !== newStatus) {
          await db.updateFixture(fixture.id, { status: newStatus });
          updates.upcomingCount++;
        }
      }
      // Rule 5: Today's matches - lock them (too late to predict)
      else if (matchDate >= todayStart && matchDate <= todayEnd) {
        newStatus = 'locked';
        if (fixture.status !== newStatus) {
          await db.updateFixture(fixture.id, { status: newStatus });
          updates.upcomingCount++;
        }
      }

      console.log(`Fixture ${fixture.teamA} vs ${fixture.teamB} - Date: ${matchDate.toISOString()} - Status: ${fixture.status} → ${newStatus}`);
    }

    return NextResponse.json({
      success: true,
      message: `✅ Auto-updated ${updates.openCount + updates.completedCount + updates.upcomingCount} fixtures`,
      updates,
      currentIndiaTime: indiaTime.toISOString(),
      cutoffTime: todayAt1PM.toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to auto-update fixtures:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to auto-update fixtures',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
