'use client';

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PetDetailModal } from '@/app/components/PetDetailModal';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  dateOfBirth: string;
  profilePictureUrl?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  profilePictureUrl?: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const token = localStorage.getItem('pettypet_token');
        const userJson = localStorage.getItem('pettypet_user');

        if (!token || !userJson) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(userJson);
        setUser(userData);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('pettypet_token');
            localStorage.removeItem('pettypet_user');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch pets');
        }

        const data = await response.json();
        setPets(data.data || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(errorMsg);
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.2,
      },
    }),
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral via-neutral to-neutral flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🐾
          </motion.div>
          <p className="text-text-primary font-medium text-lg">Loading your pets...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-br from-neutral via-neutral to-neutral min-h-screen pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
          {/* Header with User Profile */}
          <motion.div
            className="mb-10"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0 }}
            >
              {/* User Profile Picture */}
              {user && (
                <motion.div
                  className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary/20 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0, duration: 0.2 }}
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </motion.div>
              )}
              <div>
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🐾
                </motion.span>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary font-heading">
                  Welcome{user && `, ${user.name}`}!
                </h1>
              </div>
            </motion.div>
            <p className="text-text-primary text-lg">
              {pets.length === 0
                ? 'No pets yet. Add your first furry friend!'
                : `You have ${pets.length} ${pets.length === 1 ? 'pet' : 'pets'}`}
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-error/10 border-l-4 border-error rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-error font-medium">{error}</p>
            </motion.div>
          )}

          {/* Pets Grid */}
          {pets.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {pets.map((pet) => (
                <motion.div
                  key={pet.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => { setSelectedPetId(pet.id); setShowPetModal(true); }}
                  className="group cursor-pointer"
                >
                  <div className="card-hover bg-white rounded-2xl overflow-hidden">
                    {/* Pet Image / Icon Background */}
                    {pet.profilePictureUrl ? (
                      <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                        <img
                          src={pet.profilePictureUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex justify-center items-center h-40">
                        <motion.div
                          className="text-7xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {petEmojis[pet.type?.toLowerCase()] || petEmojis.default}
                        </motion.div>
                      </div>
                    )}

                    {/* Pet Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-text-primary font-heading">
                          {pet.name}
                        </h3>
                        <motion.div
                          className="badge badge-primary"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {pet.type}
                        </motion.div>
                      </div>

                      <p className="text-sm text-text-primary mb-4">
                        {pet.breed} • Born {new Date(pet.dateOfBirth).toLocaleDateString()}
                      </p>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Link href={`/pets/${pet.id}`}>
                          <motion.div
                            className="btn btn-sm btn-primary flex-1 text-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            📋 View
                          </motion.div>
                        </Link>
                        <Link href={`/pets/${pet.id}/edit`}>
                          <motion.div
                            className="btn btn-sm btn-outline flex-1 text-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ✏️ Edit
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="text-6xl mb-4 inline-block"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🐶
              </motion.div>
              <h2 className="text-2xl font-bold text-text-primary mb-4 font-heading">
                No pets yet!
              </h2>
              <p className="text-primary mb-6 max-w-md">
                Start by adding your first furry, scaly, or feathered friend
              </p>
              <Link href="/pets/new">
                <motion.div
                  className="btn btn-primary inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ➕ Add Your First Pet
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Add Pet FAB (All Screens) */}
          <motion.div
            className="fixed bottom-24 right-4 z-30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Link href="/pets/new">
              <motion.button
                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl flex items-center justify-center shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                ➕
              </motion.button>
            </Link>
          </motion.div>

      <PetDetailModal
        petId={selectedPetId}
        isOpen={showPetModal}
        onClose={() => setShowPetModal(false)}
      />
        </div>
      </main>
    );
  }

