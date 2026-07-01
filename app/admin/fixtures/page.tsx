'use client';

import { useState, useEffect } from 'react';
import { Fixture, MatchStage, Team } from '@/types';
import AdminFixtureCard from '@/components/AdminFixtureCard';

export default function FixturesManagement() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [openExpanded, setOpenExpanded] = useState(true);
  const [lockedExpanded, setLockedExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitializingTeams, setIsInitializingTeams] = useState(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadFixtures(), loadTeams()]);
  };

  const loadFixtures = async () => {
    try {
      const response = await fetch('/api/fixtures');
      const data = await response.json();
      console.log('Fixtures loaded:', data.length, 'fixtures');
      setFixtures(data);
      return data;
    } catch (error) {
      console.error('Failed to load fixtures:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      console.log('Teams loaded:', data.length, 'teams');
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const copyTodaysMatches = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const todaysFixtures = fixtures.filter(f => {
      const fixtureDate = new Date(f.matchDate).toISOString().split('T')[0];
      return fixtureDate === today;
    });

    if (todaysFixtures.length === 0) {
      alert('No matches scheduled for today');
      return;
    }

    const text = todaysFixtures
      .map((f, idx) => {
        const time = new Date(f.matchDate).toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return `${idx + 1}. ${f.teamAFlag} ${f.teamA} vs ${f.teamBFlag} ${f.teamB} - ${time}`;
      })
      .join('\n');

    const fullText = `⚽ TODAY'S MATCHES - ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n${text}\n\nMake your predictions now!`;

    navigator.clipboard.writeText(fullText);
    alert('Today\'s matches copied to clipboard!');
  };

  const handleEdit = (fixture: Fixture) => {
    console.log('=== EDITING FIXTURE ===');
    console.log('Fixture ID:', fixture.id);
    console.log('Teams:', fixture.teamA, 'vs', fixture.teamB);
    console.log('Full fixture object:', fixture);
    console.log('Current teams count:', teams.length);

    if (!fixture.id) {
      console.error('ERROR: Fixture is missing ID!');
      alert('Error: Cannot edit this fixture - it is missing an ID. Please refresh the page.');
      return;
    }

    setEditingFixture({ ...fixture });
    setShowCreateForm(false);
  };

  const handleDelete = async (fixtureId: string) => {
    if (!confirm('Are you sure you want to delete this fixture?')) return;

    try {
      await fetch(`/api/fixtures/${fixtureId}`, {
        method: 'DELETE',
      });
      alert('Fixture deleted successfully');
      loadFixtures();
    } catch (error) {
      console.error('Failed to delete fixture:', error);
      alert('Failed to delete fixture');
    }
  };

  const handleSave = async (fixtureData: any) => {
    try {
      console.log('handleSave called with:', fixtureData);

      if (!fixtureData.id) {
        console.error('ERROR: Fixture data is missing ID!', fixtureData);
        alert('Error: Cannot update fixture - ID is missing. Please refresh the page and try again.');
        return;
      }

      console.log('Sending PUT request to:', `/api/fixtures/${fixtureData.id}`);

      const response = await fetch(`/api/fixtures/${fixtureData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixtureData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('✅ Update successful! Response:', responseData);

        // Reload fixtures first to get updated data
        const updatedFixtures = await loadFixtures();

        // Verify the fixture was actually updated
        const updatedFixture = updatedFixtures.find((f: any) => f.id === fixtureData.id);
        if (updatedFixture) {
          console.log('✅ Verified updated fixture:', updatedFixture);
          console.log('Status:', updatedFixture.status);
          console.log('enableScorePrediction:', updatedFixture.enableScorePrediction);
          console.log('enableScorerPrediction:', updatedFixture.enableScorerPrediction);
        }

        // Close modal and show success message
        setEditingFixture(null);
        alert('✅ Fixture updated successfully!\n\nChanges are now visible on all pages.');
      } else {
        alert(`Failed to update fixture: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update fixture:', error);
      alert(`Failed to update fixture: ${error}`);
    }
  };

  const handleCreate = async (fixture: Omit<Fixture, 'id'>) => {
    try {
      const response = await fetch('/api/admin/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixture),
      });

      if (response.ok) {
        alert('Fixture created successfully');
        setShowCreateForm(false);
        loadFixtures();
      } else {
        const error = await response.json();
        alert(`Failed to create fixture: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create fixture:', error);
      alert('Failed to create fixture');
    }
  };

  const handleInitTeams = async () => {
    if (!confirm('This will initialize all 48 World Cup 2026 teams in the database. Continue?')) {
      return;
    }

    setIsInitializingTeams(true);
    try {
      const response = await fetch('/api/admin/init-teams', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        await loadTeams(); // Reload teams
      } else {
        alert(`❌ Failed to initialize teams:\n${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('Failed to initialize teams:', error);
      alert(`❌ Failed to initialize teams:\n${error.message || String(error)}`);
    } finally {
      setIsInitializingTeams(false);
    }
  };

  const handleAutoUpdate = async () => {
    if (!confirm('This will automatically set fixture statuses based on match dates:\n\n- Tomorrow\'s matches (before 1PM) → OPEN\n- Past matches → COMPLETED\n- Future matches → LOCKED (Upcoming)\n\nContinue?')) {
      return;
    }

    setIsAutoUpdating(true);
    try {
      const response = await fetch('/api/admin/auto-update-fixtures', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\nOpen: ${data.updates.openCount}\nCompleted: ${data.updates.completedCount}\nUpcoming: ${data.updates.upcomingCount}`);
        await loadFixtures();
      } else {
        alert(`❌ Failed to auto-update:\n${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('Failed to auto-update fixtures:', error);
      alert(`❌ Failed to auto-update:\n${error.message || String(error)}`);
    } finally {
      setIsAutoUpdating(false);
    }
  };

  const handleSyncFixtures = async () => {
    if (!confirm('This will import fixtures from Football-Data.org API. Continue?')) {
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/sync-fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: 2000 }), // World Cup 2022
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\nFixtures synced successfully!`);
        loadFixtures();
      } else {
        alert(`❌ Failed to sync fixtures:\n${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('Failed to sync fixtures:', error);
      alert(`❌ Failed to sync fixtures:\n${error.message || String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Separate fixtures by status
  const completedFixtures = fixtures.filter((f) => f.status === 'completed')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  const openFixtures = fixtures.filter((f) => f.status === 'open')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const lockedFixtures = fixtures.filter((f) => f.status === 'locked')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

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
            <h1 className="text-3xl font-bold text-white">Fixtures Management</h1>
            <div className="flex gap-2">
              <button
                onClick={handleAutoUpdate}
                disabled={isAutoUpdating}
                className="px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutoUpdating ? '⏳ Updating...' : '🤖 Auto-Update Status'}
              </button>
              <button
                onClick={handleSyncFixtures}
                disabled={isSyncing}
                className="px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? '⏳ Syncing...' : '🔄 Sync from API'}
              </button>
              <button
                onClick={copyTodaysMatches}
                className="px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition font-semibold shadow-sm"
              >
                📋 Copy Today's Matches
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingFixture(null);
                }}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-sm"
              >
                ➕ Create Fixture
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30"
              >
                ← Back
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {(editingFixture || showCreateForm) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingFixture ? '✏️ Edit Fixture' : '➕ Create New Fixture'}
                </h2>
                <button
                  onClick={() => {
                    setEditingFixture(null);
                    setShowCreateForm(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <FixtureForm
                  fixture={editingFixture}
                  teams={teams}
                  onSave={editingFixture ? handleSave : handleCreate}
                  onCancel={() => {
                    setEditingFixture(null);
                    setShowCreateForm(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Completed Fixtures Accordion */}
          {completedFixtures.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200">
              <button
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{completedExpanded ? '▼' : '▶'}</span>
                  <h2 className="text-xl font-bold text-gray-700">✅ Completed Matches</h2>
                  <span className="text-sm text-gray-500 font-semibold">({completedFixtures.length})</span>
                </div>
              </button>
              {completedExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedFixtures.map((fixture) => (
                      <AdminFixtureCard
                        key={fixture.id}
                        fixture={fixture}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Open Fixtures Accordion - Default Expanded */}
          {openFixtures.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg shadow-lg overflow-hidden border-4 border-green-400">
              <button
                onClick={() => setOpenExpanded(!openExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-green-100/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-green-700">{openExpanded ? '▼' : '▶'}</span>
                  <h2 className="text-2xl font-bold text-green-700">🔓 Open for Predictions</h2>
                  <span className="text-sm text-green-600 font-bold bg-green-200 px-3 py-1 rounded-full">
                    {openFixtures.length}
                  </span>
                </div>
              </button>
              {openExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openFixtures.map((fixture) => (
                      <AdminFixtureCard
                        key={fixture.id}
                        fixture={fixture}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Locked Fixtures Accordion */}
          {lockedFixtures.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200">
              <button
                onClick={() => setLockedExpanded(!lockedExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lockedExpanded ? '▼' : '▶'}</span>
                  <h2 className="text-xl font-bold text-gray-700">🔒 Upcoming Matches</h2>
                  <span className="text-sm text-gray-500 font-semibold">({lockedFixtures.length})</span>
                </div>
              </button>
              {lockedExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lockedFixtures.map((fixture) => (
                      <AdminFixtureCard
                        key={fixture.id}
                        fixture={fixture}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FixtureForm({
  fixture,
  teams,
  onSave,
  onCancel,
}: {
  fixture: Fixture | null;
  teams: Team[];
  onSave: (fixture: any) => void;
  onCancel: () => void;
}) {
  // Initialize form data, computing team IDs immediately if teams are available
  const getInitialFormData = () => {
    const teamAId = fixture && teams.length > 0
      ? teams.find(t => t.name === fixture.teamA)?.id || ''
      : '';
    const teamBId = fixture && teams.length > 0
      ? teams.find(t => t.name === fixture.teamB)?.id || ''
      : '';

    // Debug logging
    if (fixture) {
      console.log('FixtureForm - Initializing:', {
        fixtureTeamA: fixture.teamA,
        fixtureTeamB: fixture.teamB,
        teamsCount: teams.length,
        foundTeamAId: teamAId,
        foundTeamBId: teamBId,
        allTeamNames: teams.map(t => t.name),
      });
    }

    return {
      teamAId,
      teamBId,
      teamA: fixture?.teamA || '',
      teamB: fixture?.teamB || '',
      teamAFlag: fixture?.teamAFlag || '',
      teamBFlag: fixture?.teamBFlag || '',
      matchDate: fixture?.matchDate
        ? new Date(fixture.matchDate).toISOString().slice(0, 16)
        : '',
      status: fixture?.status === 'completed' ? 'completed' : (fixture?.status || 'locked'),
      result: fixture?.result || undefined,
      scoreA: fixture?.scoreA?.toString() || '',
      scoreB: fixture?.scoreB?.toString() || '',
      goalScorers: fixture?.goalScorers?.join(', ') || '',
      enableMatchOutcome: true, // Always enabled
      enableScorePrediction: fixture?.enableScorePrediction !== false,
      enableScorerPrediction: fixture?.enableScorerPrediction !== false,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Update entire form when fixture or teams change
  useEffect(() => {
    if (teams.length > 0) {
      setFormData(getInitialFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture, teams]);

  const [isFetchingScorers, setIsFetchingScorers] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleTeamChange = (field: 'teamAId' | 'teamBId', teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    if (field === 'teamAId') {
      setFormData({
        ...formData,
        teamAId: teamId,
        teamA: team.name,
        teamAFlag: team.flag,
      });
    } else {
      setFormData({
        ...formData,
        teamBId: teamId,
        teamB: team.name,
        teamBFlag: team.flag,
      });
    }
  };

  const handleFetchScorers = async () => {
    if (!fixture?.id) {
      alert('Please save the fixture first before fetching goal scorers');
      return;
    }

    setIsFetchingScorers(true);
    setFetchMessage(null);

    try {
      const response = await fetch(`/api/fixtures/${fixture.id}/fetch-scorers`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          ...formData,
          goalScorers: data.goalScorersString,
          scoreA: data.homeGoals?.toString() || formData.scoreA,
          scoreB: data.awayGoals?.toString() || formData.scoreB,
        });
        setFetchMessage({
          type: 'success',
          text: `✅ ${data.message || 'Goal scorers fetched successfully'}`
        });
      } else {
        setFetchMessage({
          type: 'error',
          text: `❌ ${data.message || 'Failed to fetch goal scorers'}`
        });
      }
    } catch (error) {
      console.error('Failed to fetch goal scorers:', error);
      setFetchMessage({
        type: 'error',
        text: '❌ Network error. Please check your connection and try again.'
      });
    } finally {
      setIsFetchingScorers(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.teamA || !formData.teamB) {
      alert('Please select both teams');
      return;
    }

    if (!formData.matchDate) {
      alert('Please select a match date and time');
      return;
    }

    const fixtureData: any = {
      teamA: formData.teamA,
      teamB: formData.teamB,
      teamAFlag: formData.teamAFlag,
      teamBFlag: formData.teamBFlag,
      stage: fixture?.stage || 'group',
      group: fixture?.group || undefined,
      matchDate: new Date(formData.matchDate).toISOString(),
      status: formData.status,
      scoreA: formData.scoreA ? parseInt(formData.scoreA) : undefined,
      scoreB: formData.scoreB ? parseInt(formData.scoreB) : undefined,
      goalScorers: formData.goalScorers
        ? formData.goalScorers.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      result: formData.result || undefined,
      enableMatchOutcome: formData.enableMatchOutcome,
      enableScorePrediction: formData.enableScorePrediction,
      enableScorerPrediction: formData.enableScorerPrediction,
    };

    // For editing, ensure we have the fixture ID
    if (fixture) {
      if (!fixture.id) {
        console.error('Fixture is missing ID:', fixture);
        alert('Error: Fixture ID is missing. Please close and reopen the edit form.');
        return;
      }
      fixtureData.id = fixture.id;
    }

    console.log('Submitting fixture data:', fixtureData);
    onSave(fixtureData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Team A</label>
          <select
            value={formData.teamAId}
            onChange={(e) => handleTeamChange('teamAId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Team A</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.flag} {team.name}
              </option>
            ))}
          </select>
          {formData.teamA && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.teamAFlag} {formData.teamA}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Team B</label>
          <select
            value={formData.teamBId}
            onChange={(e) => handleTeamChange('teamBId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Team B</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.flag} {team.name}
              </option>
            ))}
          </select>
          {formData.teamB && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.teamBFlag} {formData.teamB}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Match Date & Time</label>
          <input
            type="datetime-local"
            value={formData.matchDate}
            onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-4 border-blue-300 shadow-lg">
        <label className="block text-lg font-black text-gray-900 mb-3 uppercase">
          ⚙️ FIXTURE STATUS
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full px-4 py-3 text-lg border-4 border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-300 font-bold bg-white shadow-md"
        >
          <option value="locked">🔒 LOCKED (Upcoming)</option>
          <option value="open">🔓 OPEN for Predictions</option>
          <option value="completed">✅ COMPLETED - Enter Results Below ⬇️</option>
        </select>
        <div className={`mt-3 p-3 rounded-lg font-semibold text-sm ${
          formData.status === 'open' ? 'bg-green-100 text-green-800' :
          formData.status === 'locked' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {formData.status === 'open' && '✓ Users can make predictions'}
          {formData.status === 'locked' && '✗ Predictions not allowed'}
          {formData.status === 'completed' && '✓ Results section appears below ⬇️'}
        </div>
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          🎮 Prediction Card Sections
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Enable or disable prediction sections for this fixture. These settings control what appears on the Match Prediction cards.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg border-2 border-blue-300 opacity-90">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
            />
            <div>
              <div className="font-bold text-gray-800 flex items-center gap-2">
                Match Outcome Section
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Always Enabled</span>
              </div>
              <div className="text-xs text-gray-600">Users predict which team will win (or draw)</div>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">
            <input
              type="checkbox"
              checked={formData.enableScorePrediction}
              onChange={(e) => setFormData({ ...formData, enableScorePrediction: e.target.checked })}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <div>
              <div className="font-bold text-gray-800">Score Prediction Section</div>
              <div className="text-xs text-gray-600">Users predict the exact score (e.g., 2-1)</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">
            <input
              type="checkbox"
              checked={formData.enableScorerPrediction}
              onChange={(e) => setFormData({ ...formData, enableScorerPrediction: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
            />
            <div>
              <div className="font-bold text-gray-800">Goal Scorer Prediction Section</div>
              <div className="text-xs text-gray-600">Users predict 3 goal scorers (bonus points)</div>
            </div>
          </label>
        </div>
      </div>

      {formData.status === 'completed' && (
        <div className="grid md:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-4 border-green-400 shadow-xl">
          <div className="md:col-span-2 mb-4">
            <h3 className="text-2xl font-black text-green-900 uppercase flex items-center gap-2">
              🏆 ENTER MATCH RESULTS
              <span className="text-sm bg-green-200 px-3 py-1 rounded-full">Required for Points</span>
            </h3>
            <p className="text-sm text-green-800 font-semibold mt-1">
              Fill in all fields below to calculate user points
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-lg font-black text-gray-900 mb-2 uppercase">
              1️⃣ WHO WON?
            </label>
            <select
              value={formData.result || ''}
              onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
              className="w-full px-4 py-3 text-lg border-4 border-green-500 rounded-xl focus:ring-4 focus:ring-green-300 font-bold bg-white shadow-md"
            >
              <option value="">👉 SELECT WINNER</option>
              <option value="teamA">🏆 {formData.teamA || 'TEAM A'} WON</option>
              <option value="draw">🤝 DRAW</option>
              <option value="teamB">🏆 {formData.teamB || 'TEAM B'} WON</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-lg font-black text-gray-900 mb-2 uppercase">
              2️⃣ FINAL SCORE
            </label>
            <p className="text-sm text-amber-800 bg-amber-100 border-2 border-amber-400 rounded-lg px-3 py-2 mb-3 font-bold">
              ⚠️ After 90 min + Extra Time (120 total). NO penalty shootout goals!
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {formData.teamAFlag} {formData.teamA || 'TEAM A'} GOALS
                </label>
                <input
                  type="number"
                  value={formData.scoreA}
                  onChange={(e) => setFormData({ ...formData, scoreA: e.target.value })}
                  className="w-full px-4 py-4 text-2xl font-black border-4 border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-300 text-center bg-white shadow-md"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {formData.teamBFlag} {formData.teamB || 'TEAM B'} GOALS
                </label>
                <input
                  type="number"
                  value={formData.scoreB}
                  onChange={(e) => setFormData({ ...formData, scoreB: e.target.value })}
                  className="w-full px-4 py-4 text-2xl font-black border-4 border-purple-500 rounded-xl focus:ring-4 focus:ring-purple-300 text-center bg-white shadow-md"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-lg font-black text-gray-900 uppercase">
                3️⃣ GOAL SCORERS (Optional)
              </label>
              {fixture?.id && (
                <button
                  type="button"
                  onClick={handleFetchScorers}
                  disabled={isFetchingScorers}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-black text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFetchingScorers ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Fetching...
                    </>
                  ) : (
                    <>
                      🔄 Auto-Fill from API
                    </>
                  )}
                </button>
              )}
            </div>

            {fetchMessage && (
              <div className={`mb-2 px-3 py-2 rounded-lg text-sm font-medium ${
                fetchMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {fetchMessage.text}
              </div>
            )}

            <p className="text-sm text-blue-800 bg-blue-100 border-2 border-blue-300 rounded-lg px-3 py-2 mb-3 font-semibold">
              💡 Click "Auto-Fill" button above OR type names separated by commas below
            </p>
            <input
              type="text"
              value={formData.goalScorers}
              onChange={(e) => setFormData({ ...formData, goalScorers: e.target.value })}
              className="w-full px-4 py-3 text-lg border-4 border-yellow-400 rounded-xl focus:ring-4 focus:ring-yellow-300 font-semibold bg-white shadow-md"
              placeholder="Example: Messi, Di Maria, Messi"
            />
            <p className="text-xs text-gray-600 mt-2 font-medium">
              ℹ️ Separate with commas. Same player can appear multiple times for multiple goals.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold shadow-sm"
        >
          ✕ Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition font-semibold shadow-sm"
        >
          {fixture ? '✓ Update Fixture' : '➕ Create Fixture'}
        </button>
      </div>
    </form>
  );
}
