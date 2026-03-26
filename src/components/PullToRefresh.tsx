import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const PullToRefresh: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullThreshold = 80;
  const constraintsRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const y = useMotionValue(0);
  
  // Transform y value into rotation for the icon
  const rotate = useTransform(y, [0, pullThreshold], [0, 360]);
  const opacity = useTransform(y, [0, 20, pullThreshold], [0, 0.5, 1]);
  const scale = useTransform(y, [0, pullThreshold], [0.8, 1.1]);

  useEffect(() => {
    // Only enable if in standalone mode (PWA)
    const checkStandalone = () => {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    };
    checkStandalone();
    
    // Also listen for changes (though rare for a current session)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);
    return () => mediaQuery.removeEventListener('change', checkStandalone);
  }, []);

  const handleDragStart = () => {
    // If not at the very top, cancel the drag by setting constraints
    if (window.scrollY > 0) {
      controls.stop();
      controls.start({ y: 0 });
    }
  };

  const handleDragEnd = async (_: any, info: any) => {
    // Only refresh if we were at the top when started and pulled enough
    if (window.scrollY <= 5 && info.offset.y > pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      await controls.start({ y: 60 });
      window.location.reload();
    } else {
      controls.start({ y: 0 });
    }
  };

  // If not in PWA standalone mode, just return children
  if (!isStandalone) return <>{children}</>;

  return (
    <div className="relative overflow-hidden min-h-screen bg-black" ref={constraintsRef}>
      {/* Loading Indicator Overlay */}
      <motion.div
        style={{ y, opacity, scale, rotate }}
        animate={controls}
        className="absolute top-0 left-0 right-0 z-[100] flex justify-center py-4 pointer-events-none"
      >
        <div className="bg-zinc-800/80 backdrop-blur-md border border-zinc-700 p-3 rounded-full shadow-xl shadow-violet-600/20">
          <Loader2 
            className={`text-violet-400 ${isRefreshing ? 'animate-spin' : ''}`} 
            size={24} 
          />
        </div>
      </motion.div>

      {/* Draggable Wrapper */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 400 }}
        dragElastic={0.6}
        style={{ y }}
        animate={controls}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="relative z-10 touch-pan-down"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
