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
    const isFarcaster = Boolean(
      (window as any).fc ||
      (window as any).farcaster ||
      window.location.href.includes('warpcast.com') || 
      window.location.href.includes('farcaster.xyz')
    );
    
    setIsInsideFarcaster(isFarcaster);
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
      } else if (authKit) {
        // Outside Farcaster app, using AuthKit
        const statusResponse = await authKit.status();
        
        if (statusResponse.status === 'authenticated' && statusResponse.data) {
          const fcUser = statusResponse.data;
          const user: FarcasterUser = {
            fid: fcUser.fid.toString(),
            username: fcUser.username,
            displayName: fcUser.displayName || fcUser.username,
            pfp: fcUser.pfp || '',
            bio: fcUser.profile?.bio,
            custody: fcUser.custody?.address,
            verifications: fcUser.verifications
          };
          
          setUser(user);
          
          // Login to our backend
          const res = await apiRequest('POST', '/api/auth/login', { fid: user.fid });
          const data = await res.json();
          console.log('Logged in with AuthKit user:', data);
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
        if ((window as any).farcaster?.signin) {
          await (window as any).farcaster.signin();
          initialize(); // Re-fetch user info
        }
      } else if (authKit) {
        // Outside Farcaster app, using AuthKit
        const signInResponse = await authKit.signIn();
        
        if (signInResponse.status === 'authenticated' && signInResponse.data) {
          const fcUser = signInResponse.data;
          const user: FarcasterUser = {
            fid: fcUser.fid.toString(),
            username: fcUser.username,
            displayName: fcUser.displayName || fcUser.username,
            pfp: fcUser.pfp || '',
            bio: fcUser.profile?.bio,
            custody: fcUser.custody?.address,
            verifications: fcUser.verifications
          };
          
          setUser(user);
          
          // Login to our backend
          await apiRequest('POST', '/api/auth/login', { fid: user.fid });
        }
      } else {
        // Not in Farcaster and no AuthKit - this should typically redirect to Warpcast
        window.location.href = `https://warpcast.com/~/sign-in?response_type=message&client_id=${window.location.host}`;
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
      } else if (authKit) {
        // Outside Farcaster app, using AuthKit
        await authKit.signOut();
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
