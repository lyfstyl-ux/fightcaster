import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useFarcasterAuth } from '@/lib/farcaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Character } from '@shared/schema';

const Profile: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, signOut } = useFarcasterAuth();
  
  const { data: userDataResponse, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!user
  });
  
  const { data: charactersData, isLoading: charactersLoading } = useQuery({
    queryKey: ['/api/characters'],
  });
  
  const { data: userBattlesData, isLoading: battlesLoading } = useQuery({
    queryKey: ['/api/battles/user/recent'],
    enabled: !!user
  });
  
  const userData = userDataResponse?.user;
  const characters: Character[] = charactersData?.characters || [];
  const recentBattles = userBattlesData?.battles || [];
  
  // Calculate stats
  const totalBattles = recentBattles.length;
  const wins = recentBattles.filter(battle => battle.won).length;
  const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
  
  const handleSignOut = async () => {
    try {
      await signOut();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-neutral-dark/60 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-neutral-mid overflow-hidden flex items-center justify-center mr-3">
                  {user && user.pfp ? (
                    <img src={user.pfp} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-2xl font-bold">
                      {userData?.username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">
                    {userData?.username || user?.username || 'Unknown User'}
                  </h2>
                  <div className="text-neutral-light/70 text-sm">
                    {userData?.ens || user?.displayName || `FID: ${user?.fid || '?'}`}
                  </div>
                </div>
              </div>
              <button 
                className="bg-neutral-mid/50 hover:bg-neutral-mid text-white text-sm px-3 py-1 rounded-lg"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-neutral-dark rounded-lg p-3 text-center">
                <div className="text-secondary text-xs mb-1">Level</div>
                <div className="text-white font-bold text-xl">{userData?.level || '-'}</div>
              </div>
              <div className="bg-neutral-dark rounded-lg p-3 text-center">
                <div className="text-primary text-xs mb-1">Rank Points</div>
                <div className="text-white font-bold text-xl">{userData?.rankPoints || '0'}</div>
              </div>
              <div className="bg-neutral-dark rounded-lg p-3 text-center">
                <div className="text-accent text-xs mb-1">Win Rate</div>
                <div className="text-white font-bold text-xl">{winRate}%</div>
              </div>
            </div>
            
            <div className="bg-neutral-dark rounded-lg p-3">
              <div className="text-xs mb-1 text-neutral-light/70">Experience</div>
              <div className="w-full bg-neutral-mid/50 rounded-full h-3 mb-1">
                <div 
                  className="bg-accent h-3 rounded-full" 
                  style={{ 
                    width: userData ? `${(userData.experience / (userData.level * 100)) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
              <div className="text-xs text-neutral-light/70">
                {userData ? `${userData.experience}/${userData.level * 100} XP` : '0/100 XP'}
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-3 text-white">Your Characters</h3>
            
            {charactersLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : characters.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {characters.slice(0, 3).map(character => (
                  <div key={character.id} className="bg-neutral-dark rounded-lg p-2 text-center overflow-hidden">
                    <div className="w-full h-16 bg-gradient-to-br from-neutral-mid to-primary-dark flex items-center justify-center rounded-md mb-2">
                      <div className="text-white text-xl font-bold opacity-70">{character.name.charAt(0)}</div>
                    </div>
                    <div className="text-white text-xs font-medium truncate">{character.name}</div>
                    <div className="text-xs text-accent">Lvl {userData?.level || 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-neutral-light/70">
                No characters found
              </div>
            )}
          </div>
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-3 text-white">Battle History</h3>
            
            {battlesLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : recentBattles.length > 0 ? (
              recentBattles.map((battle) => (
                <div key={battle.id} className="flex items-center justify-between py-2 border-b border-neutral-mid/30 last:border-0">
                  <div className="flex items-center">
                    <span className="text-white font-medium">You</span>
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
                No battle history found
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default Profile;
