'use client';

import { useState, useEffect } from 'react';
import EnrollmentForm from '@/components/EnrollmentForm';
import PredictionCard from '@/components/PredictionCard';
import FixtureCard from '@/components/FixtureCard';
import Leaderboard from '@/components/Leaderboard';
import { User, Fixture, Prediction, LeaderboardEntry, PredictionResult } from '@/types';

type Tab = 'upcoming' | 'all' | 'leaderboard' | 'admin';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [openExpanded, setOpenExpanded] = useState(true);
  const [lockedExpanded, setLockedExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [leaderboardLastUpdated, setLeaderboardLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserData = localStorage.getItem('userData');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    // Check if session has expired (30 days)
    if (sessionExpiry) {
      const expiryDate = new Date(sessionExpiry);
      if (expiryDate < new Date()) {
        // Session expired, clear everything
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionExpiry');
        setIsLoading(false);
        return;
      }
    }

    if (savedUserId) {
      // Load cached user data immediately to prevent logout flash
      if (savedUserData) {
        try {
          const cachedUser = JSON.parse(savedUserData);
          setCurrentUser(cachedUser);
        } catch (e) {
          console.error('Failed to parse cached user data');
        }
      }

      // Then refresh from server
      loadUserData(savedUserId);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh leaderboard when switching to leaderboard tab
  useEffect(() => {
    if (activeTab === 'leaderboard' && currentUser) {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadUserData = async (userId: string) => {
    try {
      const [fixturesRes, predictionsRes, leaderboardRes, usersRes] = await Promise.all([
        fetch('/api/fixtures'),
        fetch(`/api/predictions?userId=${userId}`),
        fetch('/api/leaderboard'),
        fetch('/api/users'),
      ]);

      const fixturesData = await fixturesRes.json();
      const predictionsData = await predictionsRes.json();
      const leaderboardData = await leaderboardRes.json();
      const users = await usersRes.json();

      setFixtures(fixturesData);
      setPredictions(predictionsData);
      setLeaderboard(leaderboardData);

      const user = users.find((u: User) => u.id === userId);

      // Only set user if found, otherwise keep current user or logout
      if (user) {
        setCurrentUser(user);
        // Cache user data to prevent logout on navigation
        localStorage.setItem('userData', JSON.stringify(user));

        // Refresh session expiry on successful data load
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('sessionExpiry', expiryDate.toISOString());
      } else {
        console.error('User not found, clearing session');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionExpiry');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Don't logout on network errors, keep current user
      // This prevents logout when navigating between pages or on temporary network issues
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (firstName: string, phoneNumber: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, phoneNumber }),
      });

      const user = await response.json();
      setCurrentUser(user);

      // Set session with 30-day expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      localStorage.setItem('userId', user.id);
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('sessionExpiry', expiryDate.toISOString());

      await loadUserData(user.id);
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const handlePredict = async (
    fixtureId: string,
    prediction: PredictionResult,
    scoreA?: number,
    scoreB?: number,
    goalScorers?: string[]
  ) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fixtureId,
          prediction,
          scoreA,
          scoreB,
          goalScorers,
        }),
      });

      const newPrediction = await response.json();
      setPredictions((prev) => {
        const filtered = prev.filter((p) => p.fixtureId !== fixtureId);
        return [...filtered, newPrediction];
      });

      const leaderboardRes = await fetch('/api/leaderboard');
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to submit prediction:', error);
      alert('Failed to submit prediction. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <EnrollmentForm onEnroll={handleEnroll} />;
  }

  const openFixtures = fixtures.filter((f) => f.status === 'open');
  const upcomingFixtures = [...openFixtures].slice(0, 6);

  // Separate fixtures by status
  const completedFixtures = fixtures.filter((f) => f.status === 'completed')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()); // Most recent first
  const openFixturesAll = fixtures.filter((f) => f.status === 'open')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()); // Earliest first
  const lockedFixtures = fixtures.filter((f) => f.status === 'locked')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()); // Earliest first

  const isAdmin = currentUser?.isAdmin || false;

  // Debug logging for admin status
  console.log('🔍 Admin Check:', {
    currentUser: currentUser?.firstName,
    phone: currentUser?.phoneNumber,
    isAdmin: currentUser?.isAdmin,
    isAdminVar: isAdmin,
  });

  const copyMatchPredictionMatches = () => {
    // Copy all matches from Match Prediction tab (upcomingFixtures - first 6 open fixtures)
    if (upcomingFixtures.length === 0) {
      alert('No matches available for predictions');
      return;
    }

    const text = upcomingFixtures
      .map((f, idx) => {
        return `${idx + 1}. ${f.teamAFlag} ${f.teamA} vs ${f.teamBFlag} ${f.teamB}`;
      })
      .join('\n');

    const fullText = `⚽ MAKE YOUR PREDICTIONS\n\n${text}\n\nMake your predictions now!`;

    navigator.clipboard.writeText(fullText);
    alert(`${upcomingFixtures.length} matches copied to clipboard!`);
  };

  const copyLeaderboard = () => {
    const text = leaderboard
      .map((entry) => {
        const movement =
          !entry.previousRank ? '→' :
          entry.previousRank > entry.rank ? '↑' :
          entry.previousRank < entry.rank ? '↓' : '→';
        const trophy = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
        return `${entry.rank}. ${movement} ${trophy} ${entry.userName} - ${entry.totalPoints} pts ${entry.pointsChange > 0 ? `(+${entry.pointsChange})` : ''}`;
      })
      .join('\n');

    const fullText = `🏆 LEADERBOARD - FIFA 2026 🏆\n${new Date().toLocaleDateString()}\n\n${text}`;

    navigator.clipboard.writeText(fullText);
    alert('Leaderboard copied to clipboard!');
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardRes = await fetch('/api/leaderboard');
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData);
      setLeaderboardLastUpdated(new Date());
      console.log('✅ Leaderboard refreshed:', leaderboardData.length, 'entries');
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const handleLeaderboardRefresh = async () => {
    console.log('🔄 Manually refreshing leaderboard...');
    await loadLeaderboard();
  };

  const handleRefresh = async () => {
    if (!currentUser) return;

    setIsRefreshing(true);
    try {
      await loadUserData(currentUser.id);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      localStorage.removeItem('sessionExpiry');
      setCurrentUser(null);
      setFixtures([]);
      setPredictions([]);
      setLeaderboard([]);
      setActiveTab('upcoming');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fifa-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">⚽ FIFA World Cup 2026</h1>
              <p className="text-white/90">Welcome, {currentUser.firstName}! {isAdmin && '(Admin)'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition border border-white/30 flex items-center justify-center"
                title="Logout"
              >
                <span className="text-xl">⏻</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'fifa-gradient text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Match Prediction
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'all'
                ? 'fifa-gradient text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            All Fixtures
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'fifa-gradient text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Leaderboard
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'fifa-gradient text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              Admin
            </button>
          )}
        </div>

        {activeTab === 'upcoming' && (
          <>
            {isAdmin && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={copyMatchPredictionMatches}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg"
                >
                  Copy Matches
                </button>
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingFixtures.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">
                  No upcoming matches available for predictions
                </div>
              ) : (
                upcomingFixtures.map((fixture) => (
                  <PredictionCard
                    key={fixture.id}
                    fixture={fixture}
                    existingPrediction={predictions.find((p) => p.fixtureId === fixture.id)}
                    onPredict={handlePredict}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'all' && (
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
                        <FixtureCard key={fixture.id} fixture={fixture} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Open Fixtures Accordion - Default Expanded */}
            {openFixturesAll.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg shadow-lg overflow-hidden border-4 border-green-400">
                <button
                  onClick={() => setOpenExpanded(!openExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-green-100/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-green-700">{openExpanded ? '▼' : '▶'}</span>
                    <h2 className="text-2xl font-bold text-green-700">🔓 Open for Predictions</h2>
                    <span className="text-sm text-green-600 font-bold bg-green-200 px-3 py-1 rounded-full">
                      {openFixturesAll.length}
                    </span>
                  </div>
                </button>
                {openExpanded && (
                  <div className="px-6 pb-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {openFixturesAll.map((fixture) => (
                        <FixtureCard key={fixture.id} fixture={fixture} />
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
                        <FixtureCard key={fixture.id} fixture={fixture} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <>
            {isAdmin && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Admin Note:</strong> Changes in "Manage Participants" are reflected here automatically.
                  Click "🔄 Refresh" below if needed.
                </p>
              </div>
            )}
            <Leaderboard
              entries={leaderboard}
              onRefresh={handleLeaderboardRefresh}
              lastUpdated={leaderboardLastUpdated || undefined}
            />
          </>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="/admin/fixtures"
              className="block p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-xl text-center"
            >
              <div className="text-5xl mb-4">⚽</div>
              <div className="font-bold text-2xl mb-2">Fixture Management</div>
              <div className="text-sm text-blue-100">Create, edit, and manage all matches</div>
            </a>
            <a
              href="/admin/participants"
              className="block p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition shadow-xl text-center"
            >
              <div className="text-5xl mb-4">👥</div>
              <div className="font-bold text-2xl mb-2">Manage Participants</div>
              <div className="text-sm text-purple-100">View and manage all users</div>
            </a>
            <a
              href="/admin/rules"
              className="block p-8 bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition shadow-xl text-center"
            >
              <div className="text-5xl mb-4">📋</div>
              <div className="font-bold text-2xl mb-2">Points Rules</div>
              <div className="text-sm text-yellow-100">Configure points system</div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
