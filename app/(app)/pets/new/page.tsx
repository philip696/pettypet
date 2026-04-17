'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FormData {
  name: string;
  type: string;
  breed: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  profileImageUrl?: string;
}

interface PreviewImage {
  url: string;
  file: File;
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

export default function NewPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewImage | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'Dog',
    breed: '',
    gender: 'other',
    dateOfBirth: '',
    profileImageUrl: '',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const getPetEmoji = (type: string): string => {
    const lowerType = type.toLowerCase();
    return petEmojis[lowerType] || petEmojis.default;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a JPG, PNG, WebP, or GIF image');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({
          url: reader.result as string,
          file,
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, tempPetId: string): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'pet-photos');
      formData.append('petId', tempPetId);

      const token = localStorage.getItem('pettypet_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pettypet_token');

      if (!token) {
        router.push('/login');
        return;
      }

      let imageUrl: string | undefined;

      // Upload image if one was selected
      if (preview?.file) {
        const tempId = `temp-${Date.now()}`;
        imageUrl = await uploadImage(preview.file, tempId) || undefined;
        if (!imageUrl && preview.file) {
          // If we had a file but upload failed, don't proceed
          return;
        }
      }

      const payload: any = {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      if (imageUrl) {
        payload.profile_picture_url = imageUrl;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create pet');
      }

      const data = await response.json();

      // Redirect to pet detail page
      if (data.data?.id) {
        router.push(`/pets/${data.data.id}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-border-color"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <motion.button
              className="text-text-primary hover:text-text-primary font-medium transition-colors flex items-center gap-2"
              whileHover={{ x: -4 }}
            >
              ← Back
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
            🐾 Add New Pet
          </h1>
          <div className="w-16" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Pet Type Preview */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <p className="text-6xl mb-4">{getPetEmoji(formData.type)}</p>
            <p className="text-text-primary font-medium">
              You are adding a new {formData.type}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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

            {/* Pet Name */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Pet Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Max, Whiskers, Buddy"
                required
                className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300"
              />
            </motion.div>

            {/* Pet Type */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Pet Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300"
              >
                {petTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Breed */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g., Golden Retriever, Siamese, Lop"
                className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300"
              />
            </motion.div>

            {/* Gender */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300"
              >
                <option value="male">Male ♂️</option>
                <option value="female">Female ♀️</option>
                <option value="other">Other</option>
              </select>
            </motion.div>

            {/* Date of Birth */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral border-2 border-border-color rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300"
              />
            </motion.div>

            {/* Profile Picture Upload (Optional) */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Profile Picture (Optional) 📸
              </label>
              
              {/* Image Preview */}
              {preview ? (
                <motion.div
                  className="relative mb-4 rounded-2xl overflow-hidden border-2 border-border-color bg-neutral p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={preview.url}
                    alt="Pet preview"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {preview.file.name}
                      </p>
                      <p className="text-xs text-primary">
                        {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                      }}
                      className="text-text-primary hover:text-text-primary font-semibold text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      Remove
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-border-color rounded-2xl bg-gradient-to-br from-neutral to-neutral cursor-pointer hover:from-neutral hover:to-neutral transition-all duration-300">
                    <motion.div
                      className="flex flex-col items-center justify-center pt-8 pb-8"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <motion.div
                        className="text-5xl font-light text-text-secondary mb-2"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        +
                      </motion.div>
                      <p className="text-text-primary font-semibold text-center">
                        Click to upload
                      </p>
                      <p className="text-xs text-primary text-center mt-1">
                        JPG, PNG, WebP, or GIF • Max 5MB
                      </p>
                    </motion.div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </motion.div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-gradient-to-r from-secondary to-primary text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading || uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  {uploading ? 'Uploading Photo...' : 'Creating Pet...'}
                </span>
              ) : (
                '🐾 Create Pet'
              )}
            </motion.button>

            {/* Cancel Link */}
            <Link href="/dashboard">
              <motion.button
                type="button"
                className="w-full bg-secondary/40 text-text-primary font-semibold py-3 px-6 rounded-2xl hover:bg-secondary/40 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </Link>
          </motion.form>

          {/* Helpful Tip */}
          <motion.div
            className="mt-8 bg-neutral border-l-4 border-primary p-4 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-text-primary text-sm">
              <span className="font-semibold">💡 Tip:</span> You can always edit
              your pet&apos;s information later from their profile page.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
