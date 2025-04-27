import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BattleAnimation from '@/components/BattleAnimation';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { battleService } from '@/lib/websocket';
import { Move, BattleState } from '@shared/schema';

const BattleArena: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentAnimation, setCurrentAnimation] = useState<'attack' | 'heal' | 'critical' | 'special' | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // For this example, we'll use a hardcoded battle ID
  // In a real app, this would come from route params or state
  const battleId = 1;
  
  // Ref to store the current battle state for WebSocket updates
  const battleStateRef = useRef<BattleState | undefined>(undefined);
  
  // Initial data fetch (without polling)
  const { data: battleData, isLoading: battleLoading } = useQuery<{
    battle: any;
    battleState: BattleState;
  }>({
    queryKey: ['/api/battles', battleId],
    // No polling - using WebSocket for updates instead
  });
  
  const battle = battleData?.battle;
  const [battleState, setBattleState] = useState<BattleState | undefined>(undefined);
  
  // Set the initial battle state and update the ref
  useEffect(() => {
    if (battleData?.battleState) {
      setBattleState(battleData.battleState);
      battleStateRef.current = battleData.battleState;
    }
  }, [battleData]);
  
  // Setup battle service for real-time updates
  useEffect(() => {
    if (!battleId) return;
    
    // Tell battle service which battle to focus on
    battleService.setBattleId(battleId);
    
    // Subscribe to battle updates
    const handleBattleUpdate = (message: any) => {
      if (message.battleId === battleId && message.data?.battleState) {
        // Update the battle state
        setBattleState(message.data.battleState);
        battleStateRef.current = message.data.battleState;
        
        // Also update the battle log
        if (message.data.battleState.battleLog) {
          setBattleLog(message.data.battleState.battleLog);
        }
        
        // Check if battle is completed
        if (message.data.battleState.status === 'completed') {
          setTimeout(() => {
            navigate('/battle-results');
          }, 2000);
        }
      }
    };
    
    // Connect to battle service and listen for updates
    battleService.onConnect(() => {
      console.log('Connected to battle service, ready for updates');
    });
    
    battleService.subscribe('BATTLE_UPDATE', handleBattleUpdate);
    
    // Cleanup when component unmounts
    return () => {
      battleService.unsubscribe('BATTLE_UPDATE', handleBattleUpdate);
      battleService.setBattleId(null); // Stop polling this battle
    };
  }, [battleId, navigate]);
  
  // Mocked character data for the UI
  // In a real app, this would come from API
  const userCharacter = {
    id: 1,
    name: "Fire Samurai",
    healthPercent: battleState ? (battleState.player1Health) : 100,
    moves: [
      { 
        id: 1, 
        name: "Basic Attack", 
        damage: "15-25", 
        effect: null,
        characterId: 1,
        description: "A basic sword attack",
        cooldown: null
      },
      { 
        id: 2, 
        name: "Inferno Slash", 
        damage: "30-45", 
        effect: "burn",
        characterId: 1,
        description: "A powerful fire attack with burn effect", 
        cooldown: null
      },
      { 
        id: 3, 
        name: "Defensive Stance", 
        damage: null,
        effect: "defense_boost",
        characterId: 1,
        description: "+30% DEF Next Turn", 
        cooldown: null
      },
      { 
        id: 4, 
        name: "Healing Flame", 
        damage: null,
        effect: "heal",
        characterId: 1,
        description: "Restore 15-25 HP", 
        cooldown: null
      }
    ] as Move[]
  };
  
  const opponentCharacter = {
    id: 2,
    name: "Shadow Assassin",
    healthPercent: battleState ? (battleState.player2Health) : 100
  };
  
  // Action mutation
  const actionMutation = useMutation({
    mutationFn: async (move: Move) => {
      const action = {
        type: move.damage ? 'attack' : (move.effect === 'heal' ? 'heal' : 'buff'),
        moveId: move.id,
        moveName: move.name,
        damage: move.damage,
        effect: move.effect,
        targetId: 2 // Hardcoded opponent ID for this example
      };
      
      const response = await apiRequest('POST', `/api/battles/${battleId}/action`, action);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/battles', battleId] });
      
      // Update battle log
      if (data.battleState?.battleLog) {
        setBattleLog(data.battleState.battleLog);
      }
      
      // Check if battle is over
      if (data.battleState?.status === 'completed') {
        setTimeout(() => {
          navigate('/battle-results');
        }, 2000);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  });
  
  useEffect(() => {
    // Update battle log when battleState changes
    if (battleState?.battleLog) {
      setBattleLog(battleState.battleLog);
    }
    
    // Check if battle is over
    if (battleState?.status === 'completed') {
      setTimeout(() => {
        navigate('/battle-results');
      }, 2000);
    }
  }, [battleState, navigate]);
  
  useEffect(() => {
    // Auto-play logic
    if (autoPlay && battleState?.currentPlayerId === 1 && !actionMutation.isPending) {
      // Automatically perform a random action after a delay
      const timer = setTimeout(() => {
        const randomMoveIndex = Math.floor(Math.random() * userCharacter.moves.length);
        performAction(userCharacter.moves[randomMoveIndex]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, battleState, actionMutation.isPending]);
  
  const performAction = (move: Move) => {
    // Determine animation type based on move
    let animationType: 'attack' | 'heal' | 'critical' | 'special' | null = null;
    
    if (move.damage) {
      // 20% chance for critical hit animation
      animationType = Math.random() < 0.2 ? 'critical' : 'attack';
    } else if (move.effect === 'heal') {
      animationType = 'heal';
    } else {
      animationType = 'special';
    }
    
    // Show animation
    setCurrentAnimation(animationType);
    
    // Perform action after animation completes
    setTimeout(() => {
      actionMutation.mutate(move as Move);
    }, 1000);
  };
  
  const handleAnimationComplete = () => {
    setCurrentAnimation(null);
  };
  
  const surrenderBattle = async () => {
    // In a real app, this would call an API to surrender
    toast({
      title: "Battle Surrendered",
      description: "You have surrendered the battle.",
    });
    
    setTimeout(() => {
      navigate('/battle-results');
    }, 1000);
  };
  
  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    toast({
      title: autoPlay ? "Auto Play Disabled" : "Auto Play Enabled",
      description: autoPlay 
        ? "You now have manual control of your character." 
        : "Your character will automatically fight for you."
    });
  };
  
  const isUserTurn = battleState?.currentPlayerId === 1;
  const statusText = isUserTurn ? "Your turn" : "Opponent's turn";
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative h-64 mb-6 overflow-hidden rounded-xl battle-bg">
            {/* User Character */}
            <div className="absolute left-1/4 bottom-0 transform -translate-x-1/2">
              <div className="mb-2 text-center">
                <div className="inline-block bg-neutral-dark/80 rounded-full px-2 py-0.5 text-xs text-white">
                  {userCharacter.name}
                </div>
              </div>
              <div className="w-36 h-36 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C35.5 15 25 25.5 25 40C25 54.5 35.5 75 50 85C64.5 75 75 54.5 75 40C75 25.5 64.5 15 50 15Z" fill="#FF6B6B"/>
                  <path d="M50 20C38.9543 20 30 28.9543 30 40C30 51.0457 38.9543 75 50 80C61.0457 75 70 51.0457 70 40C70 28.9543 61.0457 20 50 20Z" fill="#FF8A8A"/>
                  <path d="M50 30C44.4772 30 40 34.4772 40 40C40 45.5228 44.4772 55 50 60C55.5228 55 60 45.5228 60 40C60 34.4772 55.5228 30 50 30Z" fill="white"/>
                </svg>
              </div>
              <div className="mt-1 w-full bg-neutral-dark/50 rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: `${userCharacter.healthPercent}%` }}></div>
              </div>
            </div>
            
            {/* Opponent Character */}
            <div className="absolute left-3/4 bottom-0 transform -translate-x-1/2">
              <div className="mb-2 text-center">
                <div className="inline-block bg-neutral-dark/80 rounded-full px-2 py-0.5 text-xs text-white">
                  {opponentCharacter.name}
                </div>
              </div>
              <div className="w-36 h-36 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 30L70 70" stroke="#333" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M70 30L30 70" stroke="#333" strokeWidth="8" strokeLinecap="round"/>
                  <circle cx="50" cy="50" r="30" stroke="#5D3FD3" strokeWidth="6" fill="none"/>
                  <circle cx="50" cy="50" r="20" fill="#7A5FE9"/>
                </svg>
              </div>
              <div className="mt-1 w-full bg-neutral-dark/50 rounded-full h-2">
                <div className="bg-error h-2 rounded-full" style={{ width: `${opponentCharacter.healthPercent}%` }}></div>
              </div>
            </div>
            
            {/* Battle Animation */}
            <BattleAnimation 
              animationType={currentAnimation} 
              onAnimationComplete={handleAnimationComplete} 
            />
          </div>
          
          {/* Battle Log */}
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-4 h-32 overflow-y-auto">
            <div className="text-xs text-neutral-light/70">
              {battleLog.map((log, index) => (
                <div key={index} className="mb-1">» {log}</div>
              ))}
            </div>
          </div>
          
          {/* Battle Controls */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {userCharacter.moves.map((move) => (
              <button 
                key={move.id}
                className={`${
                  move.effect === 'heal' 
                    ? 'bg-info hover:bg-info/80 shadow-info/30' 
                    : move.effect === 'burn' 
                      ? 'bg-secondary hover:bg-secondary-light shadow-secondary/30' 
                      : move.effect === 'defense_boost' 
                        ? 'bg-accent hover:bg-accent-light shadow-accent/30' 
                        : 'bg-primary hover:bg-primary-light shadow-primary/30'
                } text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex flex-col items-center ${
                  (!isUserTurn || actionMutation.isPending || currentAnimation) && 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => isUserTurn && !actionMutation.isPending && !currentAnimation && performAction(move)}
                disabled={!isUserTurn || actionMutation.isPending || !!currentAnimation}
              >
                <span className="text-sm font-medium">{move.name}</span>
                <span className="text-xs text-neutral-light/70">{move.damage || move.description}</span>
              </button>
            ))}
          </div>
          
          {/* Battle Status */}
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${isUserTurn ? 'bg-success' : 'bg-error'} animate-pulse mr-2`}></div>
              <span className="text-white font-medium">{statusText}</span>
            </div>
            <div>
              <span className="text-neutral-light/70 text-sm">Turn:</span>
              <span className="text-white font-medium ml-1">{battleState?.currentTurn || 1}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 bg-error hover:bg-error/80 text-white font-bold py-2 px-4 rounded-xl transition-all"
              onClick={surrenderBattle}
            >
              Surrender
            </button>
            <button 
              className={`flex-1 ${autoPlay ? 'bg-success hover:bg-success/80' : 'bg-neutral-mid hover:bg-neutral-mid/80'} text-white font-bold py-2 px-4 rounded-xl transition-all`}
              onClick={toggleAutoPlay}
            >
              {autoPlay ? 'Auto: ON' : 'Auto Play'}
            </button>
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default BattleArena;
