import React from 'react';

const percentages = [0.2, 0.4, 0.6, 0.8, 1.0];

interface PercentageSelectorProps {
  selectedScale: number;
  onScaleChange: (scale: number) => void;
}

const PercentageSelector: React.FC<PercentageSelectorProps> = ({ selectedScale, onScaleChange }) => {
  return (
    <div className="flex justify-center space-x-1 sm:space-x-2 mb-4">
      {percentages.map(scale => {
        const isActive = selectedScale === scale;
        return (
          <button
            key={scale}
            onClick={() => onScaleChange(scale)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 ${
              isActive
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {Math.round(scale * 100)}%
          </button>
        );
      })}
    </div>
  );
};

export default PercentageSelector;
