import React from 'react';
import { useLocation } from 'wouter';

interface FooterProps {
  navigateToFrame: (frame: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateToFrame }) => {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <footer className="bg-neutral-dark/80 backdrop-blur-md p-3 sticky bottom-0 z-40">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button 
          className={`flex flex-col items-center ${location === '/' ? 'text-accent' : 'text-neutral-light/70 hover:text-accent'}`} 
          onClick={() => handleNavigation('/')}
        >
          <i className="ri-home-4-line text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          className={`flex flex-col items-center ${location === '/challenges' ? 'text-accent' : 'text-neutral-light/70 hover:text-accent'}`} 
          onClick={() => handleNavigation('/challenges')}
        >
          <i className="ri-sword-line text-xl"></i>
          <span className="text-xs mt-1">Battles</span>
        </button>
        <button 
          className={`flex flex-col items-center ${location === '/leaderboard' ? 'text-accent' : 'text-neutral-light/70 hover:text-accent'}`} 
          onClick={() => handleNavigation('/leaderboard')}
        >
          <i className="ri-trophy-line text-xl"></i>
          <span className="text-xs mt-1">Leaderboard</span>
        </button>
        <button 
          className={`flex flex-col items-center ${location === '/profile' ? 'text-accent' : 'text-neutral-light/70 hover:text-accent'}`} 
          onClick={() => handleNavigation('/profile')}
        >
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
