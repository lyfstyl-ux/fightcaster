import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useFarcasterAuth } from '@/lib/farcaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const BattleResults: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { shareBattleResult } = useFarcasterAuth();
  
  // For this example, we'll use a hardcoded battle result
  // In a real app, this would come from API based on the recent battle
  const battleResult = {
    won: true,
    opponent: {
      username: "opponent123",
      ens: "opponent.eth"
    },
    character: "Fire Samurai",
    xpGained: 25,
    rankPointsChange: 15,
    characterExperience: 65,
    characterLevel: 6,
    totalTurns: 7,
    damageDealt: 145,
    damageTaken: 120,
    criticalHits: 2,
    healing: 25,
    statusEffects: 3
  };
  
  const shareResult = async () => {
    try {
      await shareBattleResult(
        battleResult.won, 
        battleResult.opponent.ens || battleResult.opponent.username,
        battleResult.character
      );
      
      toast({
        title: "Result Shared",
        description: "Your battle result has been shared on Farcaster!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share the result. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto text-center">
          {battleResult.won ? (
            <div>
              <div className="mb-6">
                <div className="text-7xl mb-2">🏆</div>
                <h2 className="font-heading text-3xl font-bold mb-2 text-success">VICTORY!</h2>
                <p className="text-neutral-light/70">
                  You defeated <span className="text-white">{battleResult.opponent.ens || battleResult.opponent.username}</span>
                </p>
              </div>
              
              <div className="bg-neutral-dark/60 rounded-xl p-6 mb-6">
                <h3 className="font-heading text-xl font-bold mb-4 text-white">Battle Rewards</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-neutral-dark rounded-lg p-3">
                    <div className="text-accent text-xs mb-1">XP Gained</div>
                    <div className="text-white font-bold text-2xl">+{battleResult.xpGained}</div>
                  </div>
                  <div className="bg-neutral-dark rounded-lg p-3">
                    <div className="text-secondary text-xs mb-1">Rank Points</div>
                    <div className="text-white font-bold text-2xl">+{battleResult.rankPointsChange}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-neutral-light/70 mb-2">Character Experience</div>
                  <div className="w-full bg-neutral-mid/50 rounded-full h-3 mb-1">
                    <div 
                      className="bg-accent h-3 rounded-full" 
                      style={{ width: `${battleResult.characterExperience}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-neutral-light/70">
                    Level {battleResult.characterLevel} ({battleResult.characterExperience}/100)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="text-7xl mb-2">😢</div>
                <h2 className="font-heading text-3xl font-bold mb-2 text-error">DEFEAT</h2>
                <p className="text-neutral-light/70">
                  You were defeated by <span className="text-white">{battleResult.opponent.ens || battleResult.opponent.username}</span>
                </p>
              </div>
              
              <div className="bg-neutral-dark/60 rounded-xl p-6 mb-6">
                <h3 className="font-heading text-xl font-bold mb-4 text-white">Battle Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-neutral-dark rounded-lg p-3">
                    <div className="text-accent text-xs mb-1">XP Gained</div>
                    <div className="text-white font-bold text-2xl">+5</div>
                  </div>
                  <div className="bg-neutral-dark rounded-lg p-3">
                    <div className="text-error text-xs mb-1">Rank Points</div>
                    <div className="text-white font-bold text-2xl">-10</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-neutral-light/70 mb-2">Character Experience</div>
                  <div className="w-full bg-neutral-mid/50 rounded-full h-3 mb-1">
                    <div 
                      className="bg-accent h-3 rounded-full" 
                      style={{ width: `${battleResult.characterExperience}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-neutral-light/70">
                    Level {battleResult.characterLevel} ({battleResult.characterExperience}/100)
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-3 text-white">Battle Stats</h3>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-neutral-light/70">Turns</div>
                <div className="text-white font-medium">{battleResult.totalTurns}</div>
              </div>
              <div>
                <div className="text-neutral-light/70">Damage Dealt</div>
                <div className="text-white font-medium">{battleResult.damageDealt}</div>
              </div>
              <div>
                <div className="text-neutral-light/70">Damage Taken</div>
                <div className="text-white font-medium">{battleResult.damageTaken}</div>
              </div>
              <div>
                <div className="text-neutral-light/70">Critical Hits</div>
                <div className="text-white font-medium">{battleResult.criticalHits}</div>
              </div>
              <div>
                <div className="text-neutral-light/70">Healing</div>
                <div className="text-white font-medium">{battleResult.healing}</div>
              </div>
              <div>
                <div className="text-neutral-light/70">Status Effects</div>
                <div className="text-white font-medium">{battleResult.statusEffects}</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 bg-neutral-mid hover:bg-neutral-mid/80 text-white font-bold py-3 px-6 rounded-xl transition-all"
              onClick={() => navigate('/')}
            >
              Return Home
            </button>
            <button 
              className="flex-1 bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/30"
              onClick={shareResult}
            >
              <i className="ri-share-line mr-2"></i>Share
            </button>
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default BattleResults;
