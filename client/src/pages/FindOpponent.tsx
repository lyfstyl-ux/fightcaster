import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';

const FindOpponent: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: recentPlayersData, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players/recent'],
  });
  
  const { data: searchResultsData, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    enabled: searchQuery.length >= 3,
  });
  
  const createChallengeMutation = useMutation({
    mutationFn: async (toUserId: number) => {
      // Hardcoded character ID for now, in a real app this would come from state
      const fromCharacterId = 1; 
      
      const response = await apiRequest('POST', '/api/challenges', {
        fromUserId: 1, // This would be the current user ID
        toUserId,
        fromCharacterId,
        status: 'pending'
      });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Sent",
        description: "Your challenge has been sent to the opponent!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send challenge. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  const recentPlayers: User[] = recentPlayersData?.players || [];
  const searchResults: User[] = searchResultsData?.users || [];
  
  const displayPlayers = searchQuery.length >= 3 ? searchResults : recentPlayers;
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const challengeUser = (userId: number) => {
    createChallengeMutation.mutate(userId);
  };
  
  const findRandomOpponent = () => {
    // In a real implementation, this would call an API to find a random opponent
    toast({
      title: "Finding Opponent",
      description: "Searching for a random opponent...",
    });
    
    // Simulate finding an opponent after a delay
    setTimeout(() => {
      navigate('/battle-arena');
    }, 2000);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">Find an Opponent</h2>
          
          <div className="mb-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by username, FID or ENS" 
                className="w-full bg-neutral-dark/60 text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-accent"
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-light/50"></i>
            </div>
          </div>
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-3 text-white">
              {searchQuery.length >= 3 ? 'Search Results' : 'Recent Players'}
            </h3>
            
            {playersLoading || searchLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : displayPlayers.length > 0 ? (
              displayPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between py-3 border-b border-neutral-mid/30 last:border-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-mid mr-3 overflow-hidden flex items-center justify-center">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white text-xl font-bold">{player.username.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{player.ens || player.username}</div>
                      <div className="text-xs text-neutral-light/50">FID: {player.fid}</div>
                    </div>
                  </div>
                  <button 
                    className="bg-secondary hover:bg-secondary-light text-white text-sm px-3 py-1 rounded-lg"
                    onClick={() => challengeUser(player.id)}
                    disabled={createChallengeMutation.isPending}
                  >
                    {createChallengeMutation.isPending ? 'Sending...' : 'Challenge'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-light/70">
                {searchQuery.length >= 3 ? 'No players found matching your search' : 'No recent players found'}
              </div>
            )}
          </div>
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-3 text-white">Challenge Random Opponent</h3>
            <p className="text-neutral-light/70 text-sm mb-3">Get matched with a random player based on your character's power level</p>
            <button 
              className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-accent/30"
              onClick={findRandomOpponent}
            >
              <i className="ri-dice-line mr-2"></i>Find Random Match
            </button>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 bg-neutral-mid hover:bg-neutral-mid/80 text-white font-bold py-3 px-6 rounded-xl transition-all"
              onClick={() => navigate('/select-character')}
            >
              Back
            </button>
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default FindOpponent;
