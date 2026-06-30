'use client';

import { useState } from 'react';

interface EnrollmentFormProps {
  onEnroll: (firstName: string, phoneNumber: string) => void;
}

export default function EnrollmentForm({ onEnroll }: EnrollmentFormProps) {
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await onEnroll(firstName.trim(), phoneNumber.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen fifa-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FIFA World Cup 2026</h1>
          <h2 className="text-xl font-semibold text-gray-700">Prediction Game</h2>
          <p className="text-gray-500 mt-2">🇺🇸 🇲🇽 🇨🇦</p>
          <p className="text-sm text-gray-600 mt-1">Join the competition!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full fifa-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Enrolling...' : '⚽ Join Game'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          By joining, you agree to participate in friendly competition
        </p>
      </div>
    </div>
  );
}
