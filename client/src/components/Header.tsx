import React from 'react';
import { useLocation } from 'wouter';
import { useFarcasterAuth } from '@/lib/farcaster';

interface HeaderProps {
  showBackButton?: boolean;
  currentFrame?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showBackButton = true,
  currentFrame
}) => {
  const [location, setLocation] = useLocation();
  const { user } = useFarcasterAuth();

  const handleNavigateBack = () => {
    window.history.back();
  };

  return (
    <header className="bg-neutral-dark/80 backdrop-blur-md px-4 py-2 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center">
        {showBackButton && (
          <div 
            className="mr-2 cursor-pointer" 
            onClick={handleNavigateBack}
          >
            <i className="ri-arrow-left-s-line text-2xl text-neutral-light hover:text-accent"></i>
          </div>
        )}
        <div className="flex items-center">
          <span className="text-accent font-heading font-bold text-xl mr-1">Cast</span>
          <span className="text-secondary font-heading font-bold text-xl">Fight</span>
          <div className="ml-2 bg-primary rounded-full px-2 py-0.5 text-xs text-white">Beta</div>
        </div>
      </div>
      <div className="flex items-center">
        {user && (
          <div className="bg-neutral-mid/50 rounded-full px-3 py-1 flex items-center text-sm">
            <span className="mr-1">FID: {user.fid}</span>
            <div className="w-2 h-2 rounded-full bg-success"></div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
