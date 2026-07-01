'use client';

export type TabType = 'predict' | 'leaderboard' | 'results' | 'stats' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin: boolean;
}

export default function BottomNav({ activeTab, onTabChange, isAdmin }: BottomNavProps) {
  const tabs = [
    { id: 'predict' as TabType, icon: '⚽', label: 'Predict', show: true },
    { id: 'leaderboard' as TabType, icon: '🏆', label: 'Board', show: true },
    { id: 'results' as TabType, icon: '📊', label: 'Results', show: true },
    { id: 'stats' as TabType, icon: '📈', label: 'Stats', show: true },
    { id: 'admin' as TabType, icon: '⚙️', label: 'Admin', show: isAdmin },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.filter(tab => tab.show).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className={`text-xs font-semibold ${activeTab === tab.id ? 'scale-105' : ''}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
