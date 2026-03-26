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
        className="fixed bottom-28 right-8 z-[100] p-4 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] text-neutral-400 hover:text-white hover:border-indigo-500/50 transition-all active:scale-95 group"
        aria-label="Refresh Page"
      >
        <RefreshCcw 
          size={24}
          className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} 
        />
      </motion.button>
    </AnimatePresence>
  );
};

export default PwaRefreshButton;
