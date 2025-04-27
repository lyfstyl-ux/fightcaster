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
    <footer className="bg-neutral-dark/90 backdrop-blur-md p-3 sticky bottom-0 z-40 border-t border-accent/20">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button 
          className={`flex flex-col items-center group transition-transform duration-200 hover:scale-110 ${
            location === '/' 
              ? 'text-accent glow-effect-nav' 
              : 'text-neutral-light/70 hover:text-accent'
          }`} 
          onClick={() => handleNavigation('/')}
        >
          <div className="relative">
            <i className="ri-home-4-fill text-2xl group-hover:animate-pulse"></i>
            <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm group-hover:bg-accent/40 transition-all duration-300"></div>
          </div>
          <span className="text-xs mt-1 font-semibold tracking-wider">Home</span>
        </button>
        <button 
          className={`flex flex-col items-center group transition-transform duration-200 hover:scale-110 ${
            location === '/challenges' 
              ? 'text-accent glow-effect-nav' 
              : 'text-neutral-light/70 hover:text-accent'
          }`} 
          onClick={() => handleNavigation('/challenges')}
        >
          <div className="relative">
            <i className="ri-sword-fill text-2xl group-hover:animate-pulse"></i>
            <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm group-hover:bg-accent/40 transition-all duration-300"></div>
          </div>
          <span className="text-xs mt-1 font-semibold tracking-wider">Battles</span>
        </button>
        <button 
          className={`flex flex-col items-center group transition-transform duration-200 hover:scale-110 ${
            location === '/leaderboard' 
              ? 'text-accent glow-effect-nav' 
              : 'text-neutral-light/70 hover:text-accent'
          }`} 
          onClick={() => handleNavigation('/leaderboard')}
        >
          <div className="relative">
            <i className="ri-trophy-fill text-2xl group-hover:animate-pulse"></i>
            <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm group-hover:bg-accent/40 transition-all duration-300"></div>
          </div>
          <span className="text-xs mt-1 font-semibold tracking-wider">Leaderboard</span>
        </button>
        <button 
          className={`flex flex-col items-center group transition-transform duration-200 hover:scale-110 ${
            location === '/profile' 
              ? 'text-accent glow-effect-nav' 
              : 'text-neutral-light/70 hover:text-accent'
          }`} 
          onClick={() => handleNavigation('/profile')}
        >
          <div className="relative">
            <i className="ri-user-fill text-2xl group-hover:animate-pulse"></i>
            <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm group-hover:bg-accent/40 transition-all duration-300"></div>
          </div>
          <span className="text-xs mt-1 font-semibold tracking-wider">Profile</span>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
