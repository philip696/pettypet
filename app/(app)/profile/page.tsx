'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('pettypet_token');
    const userJson = localStorage.getItem('pettypet_user');

    if (!token || !userJson) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      setUser(userData);
      setFormData({ name: userData.name });
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('pettypet_token');

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Update localStorage
      const updatedUser = user ? { ...user, name: formData.name } : null;
      if (updatedUser) {
        localStorage.setItem('pettypet_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-border-color border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-text-primary mb-2">Profile Settings 👤</h1>
        <p className="text-text-primary">Manage your account information</p>
      </motion.div>

      {/* Message Animation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: message ? 1 : 0, y: message ? 0 : -10 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        {message && (
          <div
            className={`p-4 rounded-lg font-medium ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary" />

        {/* Content */}
        <div className="px-6 py-8">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-20 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Full Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    editMode
                      ? 'border-border-color focus:border-primary focus:outline-none bg-white'
                      : 'border-border-color bg-neutral text-text-primary'
                  }`}
                />
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg border-2 border-border-color bg-neutral text-text-primary"
              />
              <p className="text-xs text-primary mt-1">Email cannot be changed</p>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-border-color">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">📅</p>
                <p className="text-sm text-text-primary mt-1">Account Active</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">🐾</p>
                <p className="text-sm text-text-primary mt-1">Pet Lover</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!editMode ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditMode(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  ✏️ Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-primary text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditMode(false);
                      setFormData({ name: user?.name || '' });
                    }}
                    className="flex-1 px-6 py-3 bg-secondary/40 text-text-primary font-semibold rounded-lg hover:bg-secondary/40 transition-colors"
                  >
                    ✕ Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b-2 border-border-color">
          <h2 className="text-xl font-bold text-text-primary">⚙️ Preferences</h2>
        </div>
        <div className="divide-y">
          {[
            { icon: '🔔', label: 'Notifications', desc: 'Task reminders and updates' },
            { icon: '🌙', label: 'Dark Mode', desc: 'Coming soon!' },
            { icon: '🌐', label: 'Language', desc: 'English' },
            { icon: '🔒', label: 'Privacy', desc: 'Your data is always secure' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ backgroundColor: 'rgba(249, 112, 166, 0.05)' }}
              className="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-text-primary">{item.label}</p>
                  <p className="text-sm text-text-primary">{item.desc}</p>
                </div>
              </div>
              <span className="text-text-secondary">→</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Safe Area for Mobile */}
      <div className="h-8 md:h-0" />
    </div>
  );
}
