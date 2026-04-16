'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem('pettypet_token');

        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/pets/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pet');
        }

        const data = await response.json();
        setPet(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [petId, router]);

  const calculateAge = (dateOfBirth: string | undefined): number => {
    try {
      if (!dateOfBirth) {
        return 0;
      }
      
      // Parse ISO date format (YYYY-MM-DD)
      const [year, month, day] = dateOfBirth.split('T')[0].split('-').map(Number);
      const birthDate = new Date(year, month - 1, day);
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age < 0 ? 0 : age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 0;
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    try {
      if (!dateString) {
        return 'Date not available';
      }
      
      // Parse ISO date format (YYYY-MM-DD)
      const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getPetEmoji = (type: string): string => {
    const lowerType = type.toLowerCase();
    return petEmojis[lowerType] || petEmojis.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-border-color border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral flex items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-2xl font-bold text-text-primary mb-4">
            😿 Pet not found
          </p>
          <p className="text-text-primary mb-8">{error || 'The pet you are looking for does not exist.'}</p>
          <Link href="/dashboard">
            <motion.button
              className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-border-color"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <motion.button
              className="text-text-primary hover:text-text-primary font-medium transition-colors flex items-center gap-2"
              whileHover={{ x: -4 }}
            >
              ← Back
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
            🐾 Pet Profile
          </h1>
          <div className="w-16" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Pet Avatar / Image */}
          {pet.profilePictureUrl ? (
            <motion.div
              className="relative w-full h-80 bg-gradient-to-br from-neutral to-neutral overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={pet.profilePictureUrl}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <div className="bg-gradient-to-br from-neutral to-neutral h-48 flex items-center justify-center">
              <motion.span
                className="text-9xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              >
                {getPetEmoji(pet.type)}
              </motion.span>
            </div>
          )}

          {/* Pet Info */}
          <div className="p-8">
            {/* Name and Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl font-bold text-text-primary mb-4">
                {pet.name}
              </h2>
              <div className="flex flex-wrap gap-4 mb-8">
                <span className="inline-block bg-neutral text-text-primary px-4 py-2 rounded-full font-semibold">
                  {pet.type}
                </span>
                {pet.breed && (
                  <span className="inline-block bg-neutral text-text-primary px-4 py-2 rounded-full font-semibold">
                    {pet.breed}
                  </span>
                )}
                <span className="inline-block bg-neutral text-text-primary px-4 py-2 rounded-full font-semibold">
                  {pet.gender}
                </span>
              </div>
            </motion.div>

            {/* Details Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Left Column */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  🐾 Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-text-primary text-sm font-medium">Type</p>
                    <p className="text-text-primary text-lg font-semibold capitalize">
                      {pet.type}
                    </p>
                  </div>
                  {pet.breed && (
                    <div>
                      <p className="text-text-primary text-sm font-medium">
                        Breed
                      </p>
                      <p className="text-text-primary text-lg font-semibold">
                        {pet.breed}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-text-primary text-sm font-medium">Gender</p>
                    <p className="text-text-primary text-lg font-semibold capitalize">
                      {pet.gender}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  🎂 Birth Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      Date of Birth
                    </p>
                    <p className="text-text-primary text-lg font-semibold">
                      {formatDate(pet.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">Age</p>
                    <p className="text-text-primary text-lg font-semibold">
                      {calculateAge(pet.dateOfBirth)} years old
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href={`/pets/${petId}/edit`} className="flex-1">
                <motion.button
                  className="w-full bg-gradient-to-r from-secondary to-primary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✏️ Edit Profile
                </motion.button>
              </Link>
              <Link href={`/pets/${petId}/tasks`} className="flex-1">
                <motion.button
                  className="w-full bg-primary hover:bg-primary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📋 View Care Tasks
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          className="mt-8 bg-neutral border-l-4 border-primary p-6 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-text-primary">
            <span className="font-semibold">💡 Coming Soon:</span> Care tasks,
            health records, and more detailed pet management features will be
            available soon!
          </p>
        </motion.div>
      </main>
    </div>
  );
}
