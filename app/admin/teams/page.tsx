'use client';

import { useState, useEffect } from 'react';
import { Team } from '@/types';

export default function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', flag: '' });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Team created successfully');
        setFormData({ name: '', flag: '' });
        setShowCreateForm(false);
        loadTeams();
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Team updated successfully');
        setEditingTeam(null);
        setFormData({ name: '', flag: '' });
        loadTeams();
      }
    } catch (error) {
      console.error('Failed to update team:', error);
      alert('Failed to update team');
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      alert('Team deleted successfully');
      loadTeams();
    } catch (error) {
      console.error('Failed to delete team:', error);
      alert('Failed to delete team');
    }
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, flag: team.flag });
    setShowCreateForm(false);
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingTeam(null);
    setFormData({ name: '', flag: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fifa-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Teams Management</h1>
            <div className="flex gap-2">
              <button
                onClick={startCreate}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                + Add Team
              </button>
              <a
                href="/admin"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30"
              >
                Back to Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {(showCreateForm || editingTeam) && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-6 border-2 border-blue-300">
            <h2 className="text-2xl font-bold mb-4">
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </h2>
            <form onSubmit={editingTeam ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brazil"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Flag Emoji (Click to insert: Windows + . or Mac Ctrl + Cmd + Space)
                </label>
                <input
                  type="text"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-3xl"
                  placeholder="🇧🇷"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Preview: {formData.flag} {formData.name}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTeam(null);
                    setFormData({ name: '', flag: '' });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 fifa-gradient text-white rounded-lg hover:opacity-90 transition font-semibold"
                >
                  {editingTeam ? 'Update Team' : 'Add Team'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            All Teams ({teams.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.flag}</span>
                  <span className="font-semibold text-gray-800">{team.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(team)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
