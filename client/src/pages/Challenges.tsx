import React from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Challenge {
  id: number;
  challenger: {
    id: number;
    username: string;
    ens: string | null;
    avatarUrl: string | null;
  };
  character: {
    id: number;
    name: string;
    rarity: string;
  };
  createdAt: string;
}

const Challenges: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: challengesData, isLoading } = useQuery({
    queryKey: ['/api/challenges'],
  });
  
  const challenges: Challenge[] = challengesData?.challenges || [];
  
  const acceptChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, characterId }: { challengeId: number, characterId: number }) => {
      const response = await apiRequest('POST', `/api/challenges/${challengeId}/accept`, { characterId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      toast({
        title: "Challenge Accepted",
        description: "Entering battle arena...",
      });
      
      // Navigate to battle arena with the new battle ID
      setTimeout(() => {
        navigate('/battle-arena');
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to accept challenge. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  });
  
  const rejectChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest('POST', `/api/challenges/${challengeId}/reject`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      toast({
        title: "Challenge Rejected",
        description: "Challenge has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject challenge. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  });
  
  const acceptChallenge = (challengeId: number) => {
    // For this example, we'll hardcode character ID 1
    // In a real app, the user would select a character first
    acceptChallengeMutation.mutate({ challengeId, characterId: 1 });
  };
  
  const rejectChallenge = (challengeId: number) => {
    rejectChallengeMutation.mutate(challengeId);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">Challenges</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : challenges.length > 0 ? (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-neutral-dark/60 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-mid mr-3 overflow-hidden flex items-center justify-center">
                      {challenge.challenger.avatarUrl ? (
                        <img src={challenge.challenger.avatarUrl} alt={challenge.challenger.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white text-xl font-bold">{challenge.challenger.username.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {challenge.challenger.ens || challenge.challenger.username}
                      </div>
                      <div className="text-xs text-neutral-light/70">
                        Challenges you with <span className="text-accent">{challenge.character.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-3 mt-4">
                    <button 
                      className="flex-1 bg-error hover:bg-error/80 text-white py-2 px-4 rounded-lg"
                      onClick={() => rejectChallenge(challenge.id)}
                      disabled={rejectChallengeMutation.isPending}
                    >
                      Decline
                    </button>
                    <button 
                      className="flex-1 bg-success hover:bg-success/80 text-white py-2 px-4 rounded-lg"
                      onClick={() => acceptChallenge(challenge.id)}
                      disabled={acceptChallengeMutation.isPending}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-dark/60 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="font-heading text-xl font-bold mb-2 text-white">No Challenges</h3>
              <p className="text-neutral-light/70 mb-4">
                You don't have any pending battle challenges at the moment.
              </p>
              <button 
                className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/30"
                onClick={() => navigate('/find-opponent')}
              >
                Find Opponents
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default Challenges;
