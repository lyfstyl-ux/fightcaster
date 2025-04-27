import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useFarcasterAuth } from '@/lib/farcaster';

interface RecentBattle {
  id: number;
  opponent: {
    id: number;
    username: string;
    ens: string | null;
  };
  won: boolean;
}

const Home: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user, isLoading: authLoading } = useFarcasterAuth();
  
  const { data: recentBattlesData, isLoading: battlesLoading } = useQuery({
    queryKey: ['/api/battles/user/recent'],
    enabled: !!user
  });
  
  const recentBattles: RecentBattle[] = recentBattlesData?.battles || [];
  
  const navigateToFrame = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header showBackButton={false} />
      
      <main className="flex-grow p-4">
        <div id="homeFrame" className="flex flex-col items-center justify-center">
          <div className="max-w-md w-full mx-auto text-center mb-6">
            <h1 className="font-heading text-3xl font-bold mb-3">
              <span className="text-accent">P2P</span> 
              <span className="text-white">Fighting</span> 
              <span className="text-secondary">Arena</span>
            </h1>
            <p className="text-neutral-light/80 mb-6">Challenge other Farcaster users to epic battles in this mini-game!</p>
            
            <div className="relative h-64 mb-8">
              <div className="absolute inset-0 battle-bg rounded-xl"></div>
              <div className="absolute left-1/4 bottom-0 transform -translate-x-1/2 character-animation">
                <div className="mb-2 text-center">
                  <div className="inline-block bg-neutral-dark/80 rounded-full px-2 py-0.5 text-xs text-white">
                    Fire Samurai
                  </div>
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 15C35.5 15 25 25.5 25 40C25 54.5 35.5 75 50 85C64.5 75 75 54.5 75 40C75 25.5 64.5 15 50 15Z" fill="#FF6B6B"/>
                    <path d="M50 20C38.9543 20 30 28.9543 30 40C30 51.0457 38.9543 75 50 80C61.0457 75 70 51.0457 70 40C70 28.9543 61.0457 20 50 20Z" fill="#FF8A8A"/>
                    <path d="M50 30C44.4772 30 40 34.4772 40 40C40 45.5228 44.4772 55 50 60C55.5228 55 60 45.5228 60 40C60 34.4772 55.5228 30 50 30Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <div className="absolute left-3/4 bottom-0 transform -translate-x-1/2 character-animation" style={{ animationDelay: '0.5s' }}>
                <div className="mb-2 text-center">
                  <div className="inline-block bg-neutral-dark/80 rounded-full px-2 py-0.5 text-xs text-white">
                    Shadow Assassin
                  </div>
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 30L70 70" stroke="#333" strokeWidth="8" strokeLinecap="round"/>
                    <path d="M70 30L30 70" stroke="#333" strokeWidth="8" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="30" stroke="#5D3FD3" strokeWidth="6" fill="none"/>
                    <circle cx="50" cy="50" r="20" fill="#7A5FE9"/>
                  </svg>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-4xl font-bold font-heading text-secondary animate-pulse">VS</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button 
                className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 glow-effect"
                onClick={() => navigateToFrame('/select-character')}
              >
                <i className="ri-sword-line mr-2"></i>Start New Battle
              </button>
              <button 
                className="bg-neutral-mid hover:bg-neutral-mid/80 text-white font-bold py-3 px-6 rounded-xl transition-all"
                onClick={() => navigateToFrame('/challenges')}
              >
                <i className="ri-door-lock-line mr-2"></i>View Challenges
              </button>
              <button 
                className="bg-neutral-mid/50 hover:bg-neutral-mid/30 text-white font-bold py-3 px-6 rounded-xl transition-all"
                onClick={() => navigateToFrame('/leaderboard')}
              >
                <i className="ri-trophy-line mr-2"></i>Leaderboard
              </button>
            </div>
            
            <div className="bg-neutral-dark/50 rounded-xl p-4 mb-4">
              <h3 className="font-heading text-lg font-bold mb-2 text-accent">Recent Battles</h3>
              
              {battlesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : recentBattles.length > 0 ? (
                recentBattles.map((battle) => (
                  <div key={battle.id} className="flex items-center justify-between py-2 border-b border-neutral-mid/30 last:border-0">
                    <div className="flex items-center">
                      <span className="text-white font-medium">{user?.username || 'You'}</span>
                      <span className="mx-2 text-xs text-neutral-light/50">vs</span>
                      <span className="text-white font-medium">{battle.opponent?.ens || battle.opponent?.username || 'Unknown'}</span>
                    </div>
                    <div className={`${battle.won ? 'bg-success/20 text-success' : 'bg-error/20 text-error'} text-xs px-2 py-1 rounded-full`}>
                      {battle.won ? 'Victory' : 'Defeat'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-neutral-light/70">
                  No recent battles found
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={navigateToFrame} />
    </div>
  );
};

export default Home;
