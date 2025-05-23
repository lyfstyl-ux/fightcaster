// This module integrates with the Farcaster Mini App SDK
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Farcaster user type definition
export type FarcasterUser = {
  fid: string;
  username: string;
  displayName?: string;
  pfp?: string;
  bio?: string;
  custody?: string;
  verifications?: string[];
};

// Hook to check if we're inside the Farcaster app
export const useIsFarcasterApp = (): boolean => {
  const [isInsideFarcaster, setIsInsideFarcaster] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're running inside a Farcaster environment
    const checkFarcaster = async () => {
      try {
        // Check for modern Farcaster API
        const isFarcaster = Boolean(
          (window as any).farcaster?.getAuthStatus ||
          (window as any).fc?.status ||
          window.location.href.includes('warpcast.com')
        );
        
        // Verify authentication status if available
        if ((window as any).farcaster?.getAuthStatus) {
          const status = await (window as any).farcaster.getAuthStatus();
          setIsInsideFarcaster(status.isAuthenticated);
          return;
        }
        
        setIsInsideFarcaster(isFarcaster);
      } catch (err) {
        console.warn('Farcaster detection error:', err);
        setIsInsideFarcaster(false);
      }
    };
    
    checkFarcaster();
  }, []);

  return isInsideFarcaster;
};

// Hook to authenticate with Farcaster
export const useFarcasterAuth = () => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isFarcasterApp = useIsFarcasterApp();
  
  // No AuthKit setup for now - we'll just detect if we're in Farcaster app

  // Initialize Farcaster auth
  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isFarcasterApp) {
        // In Farcaster app environment
        if ((window as any).farcaster?.isAuthenticated) {
          const userData = await (window as any).farcaster.getUserInfo();
          if (userData) {
            const user: FarcasterUser = {
              fid: userData.fid.toString(),
              username: userData.username,
              displayName: userData.displayName,
              pfp: userData.pfp,
              bio: userData?.profile?.bio
            };
            
            setUser(user);
            
            // Login to our backend
            const res = await apiRequest('POST', '/api/auth/login', { fid: user.fid });
            const data = await res.json();
            console.log('Logged in with Farcaster in-app user:', data);
          }
        }
      } else {
        // Not in Farcaster and no AuthKit
        console.warn("Farcaster SDK not available, using mock data");
        // Use mock user for development
        const mockUser: FarcasterUser = {
          fid: "12345",
          username: "user12345",
          displayName: "Test User",
          pfp: "https://i.pravatar.cc/300",
          bio: "I am a test user"
        };
        
        setUser(mockUser);
        
        // Login to our backend with the mock user
        const res = await apiRequest('POST', '/api/auth/login', { fid: mockUser.fid });
        const data = await res.json();
        console.log('Logged in with mock user:', data);
      }
    } catch (err) {
      console.error("Farcaster auth error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Farcaster
  const signIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isFarcasterApp) {
        // In Farcaster app environment
        if ((window as any).farcaster?.connect) {
          const { success, message } = await (window as any).farcaster.connect({
            timeout: 30000,
            onCancel: () => {
              throw new Error('User cancelled sign in');
            }
          });
          
          if (success) {
            await initialize();
          } else {
            throw new Error(message || 'Failed to connect');
          }
        }
      } else {
        // Not in Farcaster environment - redirect to Warpcast
        const redirectUri = `${window.location.origin}/callback`;
        window.location.href = `https://warpcast.com/~/sign-in?response_type=message&client_id=${window.location.host}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      }
    } catch (err) {
      console.error("Farcaster sign in error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isFarcasterApp) {
        // In Farcaster app environment
        if ((window as any).farcaster?.signOut) {
          await (window as any).farcaster.signOut();
        }
      }

      // Logout from our backend
      await apiRequest('POST', '/api/auth/logout', {});
      
      setUser(null);
    } catch (err) {
      console.error("Farcaster sign out error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Cast (post) a message
  const cast = async (text: string) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (isFarcasterApp) {
        // In Farcaster app environment
        if ((window as any).farcaster?.publishCast) {
          await (window as any).farcaster.publishCast({
            text
          });
          return true;
        }
      } else {
        // Outside Farcaster app
        // Redirect to Warpcast with the pre-filled text
        const encodedText = encodeURIComponent(text);
        window.open(`https://warpcast.com/~/compose?text=${encodedText}`, '_blank');
        return true;
      }
      
      throw new Error("Farcaster cast functionality not available");
    } catch (err) {
      console.error("Farcaster cast error:", err);
      throw err;
    }
  };

  // Share battle results as a Cast
  const shareBattleResult = async (won: boolean, opponentName: string, character: string) => {
    const resultText = won 
      ? `I just won a battle against ${opponentName} with my ${character} in CastFight! 🎮⚔️ Play at ${window.location.origin}`
      : `I just had an epic battle against ${opponentName} in CastFight! Better luck next time. 🎮⚔️ Play at ${window.location.origin}`;

    return cast(resultText);
  };

  // React to Casts with the CastFight mention
  const reactToCastFightMention = async (castHash: string, reaction: 'like' | 'recast') => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (isFarcasterApp && (window as any).farcaster) {
        if (reaction === 'like' && (window as any).farcaster.likeCast) {
          await (window as any).farcaster.likeCast({ castHash });
          return true;
        } else if (reaction === 'recast' && (window as any).farcaster.recastCast) {
          await (window as any).farcaster.recastCast({ castHash });
          return true;
        }
      } else {
        // Outside Farcaster app, open Warpcast
        window.open(`https://warpcast.com/~/cast/${castHash}`, '_blank');
        return true;
      }
      
      throw new Error("Farcaster reaction functionality not available");
    } catch (err) {
      console.error(`Farcaster ${reaction} error:`, err);
      throw err;
    }
  };

  // Challenge a specific user via Cast
  const challengeUser = async (username: string, characterName: string, stakeAmount?: string) => {
    const challengeText = stakeAmount
      ? `I challenge @${username} to a battle in CastFight with my ${characterName}! I'm staking ${stakeAmount} for the winner! Accept at ${window.location.origin} 🎮⚔️`
      : `I challenge @${username} to a battle in CastFight with my ${characterName}! Accept at ${window.location.origin} 🎮⚔️`;

    return cast(challengeText);
  };


  // Request notification permissions
  const requestNotifications = async () => {
    try {
      if (!isFarcasterApp || !user) return false;
      
      if ((window as any).farcaster?.requestNotifications) {
        const { success } = await (window as any).farcaster.requestNotifications();
        return success;
      }
      return false;
    } catch (err) {
      console.error('Failed to request notifications:', err);
      return false;
    }
  };

  // Get connected wallet
  const getWallet = async () => {
    try {
      if (!isFarcasterApp || !user) return null;
      
      if ((window as any).farcaster?.getWalletSigner) {
        const { success, data } = await (window as any).farcaster.getWalletSigner();
        if (success) {
          return data;
        }
      }
      return null;
    } catch (err) {
      console.error('Failed to get wallet:', err);
      return null;
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    cast,
    shareBattleResult,
    reactToCastFightMention,
    challengeUser,
    isFarcasterApp,
    requestNotifications,
    getWallet
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  return { 
    user, 
    isLoading, 
    error, 
    signIn, 
    signOut, 
    cast, 
    shareBattleResult,
    reactToCastFightMention,
    challengeUser,
    isFarcasterApp
  };
};
