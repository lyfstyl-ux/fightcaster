import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User } from '@shared/schema';

const Leaderboard: React.FC = () => {
  const [, navigate] = useLocation();
  
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });
  
  const leaderboard: User[] = leaderboardData?.leaderboard || [];
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">Leaderboard</h2>
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between border-b border-neutral-mid/30 pb-2 mb-2">
              <div className="text-xs text-neutral-light/70 font-medium">Rank</div>
              <div className="text-xs text-neutral-light/70 font-medium">Player</div>
              <div className="text-xs text-neutral-light/70 font-medium">Points</div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between py-3 border-b border-neutral-mid/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-300 text-black' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-neutral-mid/50 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-mid overflow-hidden flex items-center justify-center mr-2">
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-white text-sm font-bold">{player.username.charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{player.ens || player.username}</div>
                        <div className="text-xs text-neutral-light/50">Level {player.level}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/20 text-primary-light rounded-full px-2 py-1 text-xs font-medium">
                    {player.rankPoints} pts
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-light/70">
                No players found
              </div>
            )}
          </div>
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-3 text-white">Your Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-dark rounded-lg p-3 text-center">
                <div className="text-secondary text-xs mb-1">Rank</div>
                <div className="text-white font-bold text-xl">--</div>
              </div>
              <div className="bg-neutral-dark rounded-lg p-3 text-center">
                <div className="text-primary text-xs mb-1">Battles</div>
                <div className="text-white font-bold text-xl">--</div>
              </div>
              <div className="bg-neutral-dark rounded-lg p-3 text-center">
                <div className="text-accent text-xs mb-1">Win Rate</div>
                <div className="text-white font-bold text-xl">--%</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/30"
              onClick={() => navigate('/select-character')}
            >
              Start New Battle
            </button>
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default Leaderboard;
