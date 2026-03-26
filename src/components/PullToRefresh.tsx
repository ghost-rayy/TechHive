import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const PullToRefresh: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const pullThreshold = 90;
  const maxPull = 150;
  const startY = useRef(0);
  const isPulling = useRef(false);
  const controls = useAnimation();

  useEffect(() => {
    const checkStandalone = () => {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    };
    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);
    return () => mediaQuery.removeEventListener('change', checkStandalone);
  }, []);

  useEffect(() => {
    if (!isStandalone || isRefreshing) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pulling if at the very top
      if (window.scrollY <= 5) {
        startY.current = e.touches[0].pageY;
        isPulling.current = true;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;

      const currentY = e.touches[0].pageY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // We are pulling down at the top
        // Prevent default only if we have actually started a "pull" to avoid blocking normal scroll intent
        const resistedDiff = Math.min(diff * 0.4, maxPull);
        setPullDistance(resistedDiff);
        
        if (resistedDiff > 10) {
           if (e.cancelable) e.preventDefault();
        }
      } else {
        // Pulling up, let normal scroll happen
        isPulling.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= pullThreshold) {
        setIsRefreshing(true);
        setPullDistance(60);
        window.location.reload();
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isStandalone, isRefreshing, pullDistance]);

  // If not in PWA standalone mode, just return children
  if (!isStandalone) return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Loading Indicator */}
      <motion.div
        initial={false}
        animate={{ 
          y: pullDistance,
          opacity: pullDistance > 20 ? 1 : 0,
          scale: pullDistance > 20 ? 1 : 0.8,
          rotate: pullDistance * 2
        }}
        transition={isPulling.current ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-0 left-0 right-0 z-[100] flex justify-center py-4 pointer-events-none"
      >
        <div className="bg-zinc-800/90 backdrop-blur-md border border-zinc-700 p-3 rounded-full shadow-2xl shadow-violet-600/30">
          <Loader2 
            className={`text-violet-400 ${isRefreshing || pullDistance >= pullThreshold ? 'animate-spin' : ''}`} 
            size={24} 
          />
        </div>
      </motion.div>

      {/* Main Content (Natural scroll) */}
      <motion.div
        animate={{ y: pullDistance * 0.5 }}
        transition={isPulling.current ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
