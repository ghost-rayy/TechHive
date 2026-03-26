import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

const priceRanges: PriceRange[] = [
  { label: 'Under ₵3,000', min: 0, max: 3000 },
  { label: '₵3,000 - ₵5,000', min: 3000, max: 5000 },
  { label: '₵5,000 - ₵10,000', min: 5000, max: 10000 },
  { label: '₵10,000 - ₵20,000', min: 10000, max: 20000 },
  { label: '₵20,000 - ₵35,000', min: 20000, max: 35000 },
  { label: 'Above ₵35,000', min: 35000, max: 1000000 },
];

interface PriceFilterModalProps {
  currentRange: [number, number] | null;
  onRangeSelect: (range: [number, number] | null) => void;
  onClose: () => void;
}

const PriceFilterModal: React.FC<PriceFilterModalProps> = ({ currentRange, onRangeSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-500">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Filter by Price</h2>
            <p className="text-neutral-400 text-sm">Find the perfect laptop within your budget.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {priceRanges.map((range) => {
            const isActive = currentRange && currentRange[0] === range.min && currentRange[1] === range.max;
            return (
              <button
                key={range.label}
                onClick={() => onRangeSelect([range.min, range.max])}
                className={`px-4 py-4 rounded-2xl text-sm font-bold transition-all border text-left flex items-center justify-between group ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-neutral-800/50 border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800'
                }`}
              >
                {range.label}
                {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onRangeSelect(null)}
            className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl font-bold transition-all"
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Show Results
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceFilterModal;
