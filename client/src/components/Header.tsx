import React from 'react';
import { useLocation } from 'wouter';
import { useFarcasterAuth } from '@/lib/farcaster';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showBackButton?: boolean;
  currentFrame?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showBackButton = true,
  currentFrame
}) => {
  const [location, setLocation] = useLocation();
  const { user, signIn, signOut, isLoading, isFarcasterApp } = useFarcasterAuth();

  const handleNavigateBack = () => {
    window.history.back();
  };

  const navigateToProfile = () => {
    setLocation('/profile');
  };

  // Get user's initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user) return '?';
    if (user.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
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
        {isLoading ? (
          <div className="animate-pulse w-8 h-8 bg-neutral-mid rounded-full"></div>
        ) : user ? (
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={navigateToProfile}
          >
            <div className="text-right text-sm hidden sm:block">
              <div className="text-white font-medium">{user.displayName || user.username}</div>
              <div className="text-neutral-light text-xs">FID: {user.fid}</div>
            </div>
            <Avatar className="border-2 border-accent">
              <AvatarImage src={user.pfp} />
              <AvatarFallback className="bg-accent text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex items-center space-x-1"
            onClick={signIn}
            disabled={isLoading}
          >
            <span className="text-xs">Sign in with Farcaster</span>
            {!isFarcasterApp && (
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30Z" fill="#472A91"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9.5 13C9.5 12.4477 9.94772 12 10.5 12H21.5C22.0523 12 22.5 12.4477 22.5 13V21C22.5 21.5523 22.0523 22 21.5 22H10.5C9.94772 22 9.5 21.5523 9.5 21V13ZM11.5 14V20H20.5V14H11.5Z" fill="#FCFAFF"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M19 16C19 15.4477 19.4477 15 20 15H24C24.5523 15 25 15.4477 25 16C25 16.5523 24.5523 17 24 17H20C19.4477 17 19 16.5523 19 16Z" fill="#FCFAFF"/>
              </svg>
            )}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
