import React from 'react';

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

interface PriceFilterProps {
  currentRange: [number, number] | null;
  onRangeSelect: (range: [number, number] | null) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ currentRange, onRangeSelect }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Filter by Price</h3>
        {currentRange && (
          <button 
            onClick={() => onRangeSelect(null)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {priceRanges.map((range) => {
          const isActive = currentRange && currentRange[0] === range.min && currentRange[1] === range.max;
          return (
            <button
              key={range.label}
              onClick={() => onRangeSelect(isActive ? null : [range.min, range.max])}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PriceFilter;
