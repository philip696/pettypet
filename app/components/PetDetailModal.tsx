'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed?: string;
  gender: string;
  dateOfBirth: string;
  profilePictureUrl?: string;
  createdAt: string;
}

interface PetDetailModalProps {
  petId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const petEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  rabbit: '🐰',
  hamster: '🐹',
  bird: '🦜',
  fish: '🐠',
  turtle: '🐢',
  parrot: '🦜',
  guinea_pig: '🐹',
  default: '🐾',
};

export function PetDetailModal({ petId, isOpen, onClose }: PetDetailModalProps) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !petId) return;

    const fetchPet = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('pettypet_token');
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pets/${petId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch pet');
        const data = await response.json();
        setPet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pet');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [isOpen, petId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-500">Loading pet details...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">{error}</div>
              ) : pet ? (
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl">
                        {petEmojis[pet.type] || petEmojis.default}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {pet.name}
                        </h2>
                        <p className="text-gray-600">
                          {pet.type} • {pet.gender}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {pet.breed && (
                      <div>
                        <p className="text-sm text-gray-500">Breed</p>
                        <p className="text-lg font-medium">{pet.breed}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-lg font-medium">
                        {new Date(pet.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-lg font-medium">
                        {new Date(pet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t flex gap-4">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                    <a
                      href="/pets/new"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center"
                    >
                      Add Pet
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
