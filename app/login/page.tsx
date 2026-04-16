'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getErrorMessage } from '@/lib/api';

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Animation variants
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  const mascotVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2 },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.15 },
    },
    tap: { scale: 0.98 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  const successVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(isSignUp && { name: name || email.split('@')[0] }),
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store JWT token and user data
      if (data.data?.token) {
        localStorage.setItem('pettypet_token', data.data.token);
        localStorage.setItem('pettypet_user', JSON.stringify(data.data.user));
        setSuccess(true);

        // Redirect to dashboard after success animation
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-neutral to-transparent flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success Message */}
        {success && (
          <motion.div
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
            variants={successVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3 bg-success text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-2xl">✓</span>
              <span className="font-medium">Welcome to PettyPet!</span>
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          {/* Mascot with animation */}
          <motion.div
            className="text-8xl mb-4 inline-block cursor-pointer"
            variants={mascotVariants}
            whileHover="hover"
          >
            🐾
          </motion.div>

          {/* Logo */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2 font-heading">
            PettyPet
          </h1>

          {/* Tagline */}
          <p className="text-text-primary text-lg font-medium">
            Care for your pets with love 🐕🐈✨
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 20px 40px rgba(255, 182, 193, 0.2)' }}
        >
          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-error/10 border-l-4 border-error rounded-lg"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-error font-medium text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Name Field (Sign Up only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  disabled={loading}
                />
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                disabled={loading}
                required
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                disabled={loading}
                required
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              variants={buttonHoverVariants}
              whileHover={!loading ? 'hover' : {}}
              whileTap={!loading ? 'tap' : {}}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? '✨ Create Account' : '🔓 Login'}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Sign Up / Login */}
          <motion.button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="w-full mt-4 text-center text-sm text-text-primary hover:text-primary font-medium transition-colors"
            variants={itemVariants}
          >
            {isSignUp ? (
              <>
                Already have an account? <span className="text-primary font-bold">Login</span>
              </>
            ) : (
              <>
                Don&apos;t have an account? <span className="text-primary font-bold">Sign Up</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          className="mt-8 p-4 bg-neutral border border-secondary rounded-xl"
          variants={itemVariants}
        >
          <p className="text-sm text-text-primary font-medium mb-2">✨ Demo Credentials:</p>
          <p className="text-xs text-text-primary">
            Email: <span className="font-mono font-bold">demo@pettypet.com</span>
          </p>
          <p className="text-xs text-text-primary">
            Password: <span className="font-mono font-bold">Demo123!</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
