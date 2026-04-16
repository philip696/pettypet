'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
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
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('pettypet_token');
    localStorage.removeItem('pettypet_user');
    setShowProfileMenu(false);
    router.push('/login');
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const isActive = (path: string) => pathname === path;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-white to-neutral flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-border-color"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="text-2xl"
            >
              🐾
            </motion.div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
              PettyPet
            </h1>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-text-primary font-medium text-sm">
                {user?.name?.split(' ')[0]}
              </span>
              <motion.span
                animate={{ rotate: showProfileMenu ? 180 : 0 }}
                className="text-primary"
              >
                ▼
              </motion.span>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border-color overflow-hidden z-50"
                >
                  {/* Profile Info */}
                  <div className="bg-gradient-to-r from-primary to-primary text-white px-4 py-3">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-white/80">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-text-primary hover:bg-neutral transition-colors text-sm font-medium"
                    >
                      ⚙️ Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium border-t border-border-color"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Content Container */}
      <div className="flex flex-1 pb-20 md:pb-0">
        {/* Desktop Sidebar Navigation */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="hidden md:flex md:w-64 md:flex-col md:bg-white/50 md:backdrop-blur-md md:border-r md:border-border-color md:py-8 md:px-4 md:gap-2"
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-primary to-primary text-white shadow-lg'
                      : 'text-text-primary hover:bg-neutral'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-border-color shadow-2xl md:hidden"
      >
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center py-3 px-6 transition-all ${
                    active ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span
                    className={`text-xs font-semibold transition-all ${
                      active ? 'opacity-100' : 'opacity-70'
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 h-0.5 w-16 bg-gradient-to-r from-primary to-primary"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}
