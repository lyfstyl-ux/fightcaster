// This module integrates with the Farcaster Mini App SDK
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Farcaster user type
export type FarcasterUser = {
  fid: string;
  username: string;
  displayName?: string;
  pfp?: string;
  profile?: {
    bio?: string;
  };
};

// Mocked nonce method for development
const getNonce = async (fid: string): Promise<string> => {
  return `nonce-${fid}-${Date.now()}`;
};

// Get the Farcaster SDK from window object
// In a real app, this would be provided by the Farcaster environment
const getFarcasterSdk = () => {
  return (window as any).farcaster;
};

// Hook to authenticate with Farcaster
export const useFarcasterAuth = () => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Farcaster auth
  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fc = getFarcasterSdk();

      // If Farcaster SDK is not available
      if (!fc) {
        console.warn("Farcaster SDK not available, using mock data");
        // Use mock user for development
        const mockUser: FarcasterUser = {
          fid: "12345",
          username: "test_user",
          displayName: "Test User",
          pfp: "https://i.pravatar.cc/300",
          profile: { bio: "I am a test user" }
        };
        
        setUser(mockUser);
        
        // Login to our backend with the mock user
        const res = await apiRequest('POST', '/api/auth/login', { fid: mockUser.fid });
        const data = await res.json();
        console.log('Logged in with mock user:', data);
        
        setIsLoading(false);
        return;
      }

      // Check if user is already authenticated
      const { status, data: fcUser } = await fc.auth.getAuthStatus();
      
      if (status === "authenticated" && fcUser) {
        // User is already authenticated, set user
        const user: FarcasterUser = {
          fid: fcUser.fid.toString(),
          username: fcUser.username,
          displayName: fcUser.displayName,
          pfp: fcUser.pfp,
          profile: fcUser.profile
        };
        
        setUser(user);
        
        // Login to our backend
        await apiRequest('POST', '/api/auth/login', { fid: user.fid });
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

      const fc = getFarcasterSdk();

      if (!fc) {
        throw new Error("Farcaster SDK not available");
      }

      // Get nonce
      const fid = "0"; // Temporary FID for nonce
      const nonce = await getNonce(fid);

      // Sign in
      const { status, data: fcUser } = await fc.auth.signIn({ nonce });

      if (status === "authenticated" && fcUser) {
        // User signed in, set user
        const user: FarcasterUser = {
          fid: fcUser.fid.toString(),
          username: fcUser.username,
          displayName: fcUser.displayName,
          pfp: fcUser.pfp,
          profile: fcUser.profile
        };
        
        setUser(user);
        
        // Login to our backend
        await apiRequest('POST', '/api/auth/login', { fid: user.fid });
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

      const fc = getFarcasterSdk();

      if (fc) {
        await fc.auth.signOut();
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
      const fc = getFarcasterSdk();

      if (!fc) {
        throw new Error("Farcaster SDK not available");
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      await fc.cast.create({
        text
      });

      return true;
    } catch (err) {
      console.error("Farcaster cast error:", err);
      throw err;
    }
  };

  // Share battle results
  const shareBattleResult = async (won: boolean, opponentName: string, character: string) => {
    const resultText = won 
      ? `I just won a battle against ${opponentName} with my ${character} in CastFight! 🎮⚔️`
      : `I just had an epic battle against ${opponentName} in CastFight! Better luck next time. 🎮⚔️`;

    return cast(resultText);
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
    shareBattleResult 
  };
};
