import React from 'react';

interface LogoKkgGuslahProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showShadow?: boolean;
}

export const LogoKkgGuslah: React.FC<LogoKkgGuslahProps> = ({
  className = '',
  size = 'md',
  showShadow = true
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36'
  };

  const chosenSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${chosenSize} ${className}`}>
      <img
        src="/logo_kkg_guslah.jpg"
        alt="Logo Resmi KKG Guslah 1 Malathe Pote Kokop"
        className={`w-full h-full object-contain ${showShadow ? 'drop-shadow-md' : ''}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback to svg if jpg fails
          const target = e.currentTarget;
          if (!target.src.endsWith('logo_kkg_guslah.svg')) {
            target.src = '/logo_kkg_guslah.svg';
          }
        }}
      />
    </div>
  );
};

export default LogoKkgGuslah;
