'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: string;
  breed?: string;
  gender: string;
  date_of_birth: string;
  profile_picture_url?: string;
}

const petTypes = [
  'Dog',
  'Cat',
  'Rabbit',
  'Hamster',
  'Bird',
  'Fish',
  'Turtle',
  'Parrot',
  'Guinea Pig',
  'Other',
];

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

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    gender: 'Other',
    date_of_birth: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
        const petData = data.data;
        setPet(petData);

        // Pre-fill form
        setFormData({
          name: petData.name,
          type: petData.type,
          breed: petData.breed || '',
          gender: petData.gender,
          date_of_birth: petData.date_of_birth,
        });

        // Set image preview if exists
        if (petData.profile_picture_url) {
          setImagePreview(petData.profile_picture_url);
        }
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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('pettypet_token');

      if (!token) {
        router.push('/login');
        return;
      }

      let profilePictureUrl = pet?.profile_picture_url;

      // Upload image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        imageFormData.append('bucket', 'pet-profiles');
        imageFormData.append('petId', petId);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          profilePictureUrl = uploadData.url;
        }
      }

      // Save pet data
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          profile_picture_url: profilePictureUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save pet');
      }

      setSuccess('✅ Pet profile updated successfully!');
      setTimeout(() => {
        router.push(`/pets/${petId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('pettypet_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      setSuccess('🐾 Pet deleted successfully');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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

  if (!pet) {
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
          <Link href={`/pets/${petId}`}>
            <motion.button
              className="text-text-primary hover:text-text-primary font-medium transition-colors flex items-center gap-2"
              whileHover={{ x: -4 }}
            >
              ← Back
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
            ✏️ Edit Pet Profile
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
          transition={{ duration: 0.4 }}
        >
          {/* Pet Photo Upload Section */}
          <div className="bg-gradient-to-br from-neutral to-neutral p-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 relative">
                {imagePreview ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={imagePreview}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-6xl shadow-lg border-2 border-dashed border-border-color">
                    {getPetEmoji(pet.type)}
                  </div>
                )}
              </div>

              <label className="inline-block">
                <motion.button
                  type="button"
                  className="bg-gradient-to-r from-secondary to-primary text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📸 Change Photo
                </motion.button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  aria-label="Upload pet photo"
                />
              </label>
              <p className="text-sm text-text-primary mt-2">
                PNG, JPG up to 5MB
              </p>
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <motion.form
              onSubmit={handleSave}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Error Message */}
              {error && (
                <motion.div
                  className="bg-red-50 border-l-4 border-red-400 p-4 rounded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  className="bg-green-50 border-l-4 border-green-400 p-4 rounded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-green-700 font-medium">{success}</p>
                </motion.div>
              )}

              {/* Pet Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Pet Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Max"
                  required
                  className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-border-color focus:bg-white transition-all duration-300"
                />
              </motion.div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pet Type */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Pet Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-border-color focus:bg-white transition-all duration-300"
                  >
                    {petTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Breed */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Breed
                  </label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleFormChange}
                    placeholder="e.g., Golden Retriever"
                    className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-border-color focus:bg-white transition-all duration-300"
                  />
                </motion.div>
              </div>

              {/* Gender */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Gender *
                </label>
                <div className="flex gap-6">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleFormChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-text-primary font-medium">{gender}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Date of Birth */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-border-color focus:bg-white transition-all duration-300"
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex gap-4 flex-wrap pt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-secondary to-primary text-white font-bold py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving...
                    </span>
                  ) : (
                    '💾 Save Changes'
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🗑️ Delete Pet
                </motion.button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-sm shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <p className="text-2xl font-bold text-text-primary mb-4">
                😢 Delete {pet.name}?
              </p>
              <p className="text-text-primary mb-6">
                This action cannot be undone. All care tasks and health records for {pet.name} will be permanently deleted.
              </p>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-secondary/40 text-text-primary font-semibold py-3 rounded-lg hover:bg-secondary/40 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
