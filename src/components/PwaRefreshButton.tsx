import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PwaRefreshButton: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    };
    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);
    return () => mediaQuery.removeEventListener('change', checkStandalone);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Add a tiny delay so the user sees the spin animation before reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Only show in PWA standalone mode
  if (!isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRefresh}
        className="fixed top-24 right-4 z-[90] p-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full shadow-lg shadow-violet-600/10 text-zinc-400 hover:text-white transition-colors group"
        aria-label="Refresh Page"
      >
        <RefreshCcw 
          className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
        />
      </motion.button>
    </AnimatePresence>
  );
};

export default PwaRefreshButton;
