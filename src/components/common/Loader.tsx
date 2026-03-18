import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const loaderContent = (
    <div className="relative flex justify-center items-center">
      {/* Spinning outer ring with African colors */}
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin`}
        style={{
          border: '3px solid transparent',
          borderTopColor: '#F97316', // Orange
          borderRightColor: '#0A1929', // Dark blue
          borderBottomColor: '#008751', // Green (from many African flags)
          borderLeftColor: '#EAB308', // Gold/Yellow
        }}
      ></div>

      {/* Inner circle with African map silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className={`${iconSizes[size]} text-[#F97316]`}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* African continent silhouette */}
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2.5h-2v-3h2v-2.5l4 4-4 4z" />

          {/* Growth chart line */}
          <path
            d="M8 14L10 11L12 13L16 8"
            stroke="#0A1929"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Rising sun/Economic growth symbol */}
          <circle cx="17" cy="7" r="1.5" fill="#EAB308" />
        </svg>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0A1929] bg-opacity-95 z-50 flex items-center justify-center">
        <div className="text-center">
          {loaderContent}
          <p className="mt-4 text-[#F97316] font-medium animate-pulse">
            Loading Afro Investments...
          </p>
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;