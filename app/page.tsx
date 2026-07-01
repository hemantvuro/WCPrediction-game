'use client';

import { useState, useEffect } from 'react';
import EnrollmentForm from '@/components/EnrollmentForm';
import Leaderboard from '@/components/Leaderboard';
import BottomNav, { TabType } from '@/components/BottomNav';
import DashboardTab from '@/components/DashboardTab';
import ResultsTab from '@/components/ResultsTab';
import { User, Fixture, Prediction, LeaderboardEntry, PredictionResult } from '@/types';
import { generateWeeklyRecap } from '@/lib/weeklyRecap';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserData = localStorage.getItem('userData');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (sessionExpiry) {
      const expiryDate = new Date(sessionExpiry);
      if (expiryDate < new Date()) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        localStorage.removeItem('sessionExpiry');
        setIsLoading(false);
        return;
      }
    }

    if (savedUserId) {
      if (savedUserData) {
        try {
          const cachedUser = JSON.parse(savedUserData);
          setCurrentUser(cachedUser);
        } catch (e) {
          console.error('Failed to parse cached user data');
        }
      }
      loadUserData(savedUserId);
    } else {
      setIsLoading(false);
    }
  }, []);

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

      if (user) {
        setCurrentUser(user);
        localStorage.setItem('userData', JSON.stringify(user));

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

  const loadLeaderboard = async () => {
    try {
      const leaderboardRes = await fetch('/api/leaderboard');
      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
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
      setActiveTab('dashboard');
    }
  };

  const copyLeaderboard = () => {
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const biggestGainer = [...leaderboard].sort((a, b) => b.pointsChange - a.pointsChange)[0];

    const podiumText = top3
      .map((entry) => {
        const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉';
        const movement = !entry.previousRank ? '→' : entry.previousRank > entry.rank ? '↑' : entry.previousRank < entry.rank ? '↓' : '→';
        return `${entry.rank}. ${medal} ${movement} ${entry.userName} - ${entry.totalPoints} pts ${entry.pointsChange > 0 ? `(+${entry.pointsChange})` : ''}`;
      })
      .join('\n');

    const restText = rest
      .map((entry) => {
        const movement = !entry.previousRank ? '→' : entry.previousRank > entry.rank ? '↑' : entry.previousRank < entry.rank ? '↓' : '→';
        return `${entry.rank}. ${movement} ${entry.userName} - ${entry.totalPoints} pts ${entry.pointsChange > 0 ? `(+${entry.pointsChange})` : ''}`;
      })
      .join('\n');

    const fullText = `🏆 WC 2026 LEADERBOARD - ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })} 🏆

${podiumText}
${rest.length > 0 ? `\n${restText}` : ''}

${biggestGainer.pointsChange > 0 ? `🔥 Biggest Gainer: ${biggestGainer.userName} (+${biggestGainer.pointsChange}!)` : ''}
📊 Updates in real-time after each match

Make your predictions now! 🎯`;

    navigator.clipboard.writeText(fullText);
    alert('✅ Leaderboard copied to clipboard!');
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
  const isAdmin = currentUser?.isAdmin || false;
  const userStats = leaderboard.find(entry => entry.userId === currentUser.id) || null;
  const completedFixturesCount = fixtures.filter(f => f.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2.5 md:py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-base md:text-xl lg:text-2xl font-bold text-white">FIFA World Cup 2026</h1>
              <p className="text-white/90 text-xs">{currentUser.firstName} {isAdmin && '(Admin)'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 md:px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition text-xs md:text-sm font-semibold"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3">
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto justify-center scrollbar-hide">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 md:px-6 py-2 md:py-2.5 font-semibold text-xs md:text-sm whitespace-nowrap transition rounded-lg ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                Match Prediction
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-3 md:px-6 py-2 md:py-2.5 font-semibold text-xs md:text-sm whitespace-nowrap transition rounded-lg ${
                  activeTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 md:px-6 py-2 md:py-2.5 font-semibold text-xs md:text-sm whitespace-nowrap transition rounded-lg ${
                  activeTab === 'results'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                All Fixtures
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 md:px-6 py-2 md:py-2.5 font-semibold text-xs md:text-sm whitespace-nowrap transition rounded-lg ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            openFixtures={openFixtures}
            predictions={predictions}
            userStats={userStats}
            totalFixtures={completedFixturesCount}
            leaderboard={leaderboard}
            onPredict={handlePredict}
          />
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <>
            {isAdmin && (
              <div className="mb-4 flex justify-end gap-2 md:gap-3 flex-wrap">
                <button
                  onClick={() => {
                    const recap = generateWeeklyRecap(leaderboard);
                    navigator.clipboard.writeText(recap);
                    alert('Weekly recap copied!');
                  }}
                  className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-xs md:text-sm"
                >
                  Weekly Recap
                </button>
                <button
                  onClick={copyLeaderboard}
                  className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-xs md:text-sm"
                >
                  Copy Leaderboard
                </button>
              </div>
            )}
            <Leaderboard entries={leaderboard} />
          </>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <ResultsTab fixtures={fixtures} predictions={predictions} />
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <a
              href="/admin/fixtures"
              className="block p-4 md:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              <div className="font-bold text-lg md:text-xl mb-1">Fixture Management</div>
              <div className="text-xs md:text-sm text-blue-100">Create, edit, and manage matches</div>
            </a>
            <a
              href="/admin/participants"
              className="block p-4 md:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-lg"
            >
              <div className="font-bold text-lg md:text-xl mb-1">Participants</div>
              <div className="text-xs md:text-sm text-purple-100">Manage all users</div>
            </a>
            <a
              href="/admin/player-predictions"
              className="block p-4 md:p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition shadow-lg"
            >
              <div className="font-bold text-lg md:text-xl mb-1">Player Predictions</div>
              <div className="text-xs md:text-sm text-green-100">View prediction history</div>
            </a>
            <a
              href="/admin/rules"
              className="block p-4 md:p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
            >
              <div className="font-bold text-lg md:text-xl mb-1">Points Rules</div>
              <div className="text-xs md:text-sm text-orange-100">Configure scoring system</div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
