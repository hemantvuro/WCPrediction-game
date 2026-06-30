'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';

export default function ParticipantsManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', phoneNumber: '', points: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          phoneNumber: formData.phoneNumber || `temp_${Date.now()}`,
        }),
      });

      if (response.ok) {
        alert('✅ Participant added successfully');
        setShowAddModal(false);
        setFormData({ firstName: '', phoneNumber: '', points: '' });
        loadUsers();
      } else {
        const data = await response.json();
        alert(`❌ Failed to add participant: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to add participant:', error);
      alert('Failed to add participant');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      let finalPoints: number | undefined = undefined;

      if (formData.points) {
        const pointsStr = formData.points.trim();
        const currentPoints = editingUser.points || 0;

        // Check if it's an adjustment (+2 or -2)
        if (pointsStr.startsWith('+') || pointsStr.startsWith('-')) {
          const adjustment = parseInt(pointsStr);
          finalPoints = currentPoints + adjustment;
        } else {
          // Absolute value
          finalPoints = parseInt(pointsStr);
        }
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          phoneNumber: formData.phoneNumber,
          points: finalPoints,
        }),
      });

      if (response.ok) {
        alert('✅ Participant updated successfully');
        setEditingUser(null);
        setFormData({ firstName: '', phoneNumber: '', points: '' });
        loadUsers();
      }
    } catch (error) {
      console.error('Failed to update participant:', error);
      alert('Failed to update participant');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('⚠️ Are you sure you want to remove this participant?\n\nThis will delete all their predictions.')) return;

    try {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      alert('✅ Participant removed successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete participant:', error);
      alert('❌ Failed to delete participant');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      phoneNumber: user.phoneNumber,
      points: user.points?.toString() || '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fifa-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Participants Management</h1>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setFormData({ firstName: '', phoneNumber: '', points: '' });
                }}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-sm"
              >
                ➕ Add Participant
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
        {/* Add Participant Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Participant</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional. Auto-generated if left empty.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ firstName: '', phoneNumber: '', points: '' });
                    }}
                    className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 fifa-gradient text-white rounded-lg hover:opacity-90 transition font-semibold"
                  >
                    Add Participant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Participant Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Participant</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Points Adjustment (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., +2, -5, or 10"
                    />
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                      Current: <span className="font-bold">{editingUser.points || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 <strong>+2</strong> or <strong>-2</strong> to adjust current points, or enter <strong>10</strong> to set absolute value
                  </p>
                </div>
              </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setFormData({ firstName: '', phoneNumber: '', points: '' });
                    }}
                    className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 fifa-gradient text-white rounded-lg hover:opacity-90 transition font-semibold"
                  >
                    Update Participant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            All Participants ({users.length})
          </h2>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800">{user.firstName}</span>
                    <span className="text-sm text-gray-500">{user.phoneNumber}</span>
                    {user.points !== undefined && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Custom Points: {user.points}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No participants yet. Users will appear here after enrollment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
