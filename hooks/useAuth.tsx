import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isSupabaseConfigured = (() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isPlaceholder = (val: string | undefined) => 
      !val || val.includes('YOUR_') || val.includes('placeholder') || val.includes('<');
    
    return !isPlaceholder(url) && !isPlaceholder(key);
  })();

  // In this environment, we always fallback to Demo Mode if Supabase is not configured.
  const isDemoMode = !isSupabaseConfigured;

  useEffect(() => {
    console.log('AuthProvider: Initializing...', { isSupabaseConfigured, isDemoMode });
    
    // Initial session check
    const checkSession = async () => {
      try {
        console.log('AuthProvider: Checking session...');
        
        if (isDemoMode) {
          console.log('AuthProvider: Demo Mode detected');
          const demoUser = localStorage.getItem('demo_user');
          if (demoUser) {
            console.log('AuthProvider: Demo user found in localStorage');
            setUser(JSON.parse(demoUser));
          } else {
            console.log('AuthProvider: No demo user found');
            setUser(null);
          }
          setLoading(false);
          return;
        }

        console.log('AuthProvider: Supabase Mode detected, fetching session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthProvider: Supabase session error:', sessionError);
          setUser(null);
        } else if (session?.user) {
          console.log('AuthProvider: User found in Supabase session:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || '',
          });
        } else {
          console.log('AuthProvider: No user found in Supabase session');
          setUser(null);
        }
      } catch (err) {
        console.error('AuthProvider: Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes (only if Supabase is configured)
    let subscription: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    }

    // Also check on window focus (useful when returning from popup)
    window.addEventListener('focus', checkSession);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener('focus', checkSession);
    };
  }, [isDemoMode, isSupabaseConfigured]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      if (isDemoMode) {
        if (email === 'test@demo.com' && password === '123456') {
          const mockUser = { id: 'demo-user-id', email: 'test@demo.com', name: 'Demo User' };
          setUser(mockUser);
          localStorage.setItem('demo_user', JSON.stringify(mockUser));
          router.push('/');
          return;
        } else {
          throw new Error('Invalid test credentials');
        }
      }

      await authService.signIn(email, password);
      // User state will be updated by onAuthStateChange listener
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      if (isDemoMode) {
        throw new Error('Signup is disabled in Demo Mode. Please use the test credentials.');
      }
      await authService.signUp(email, password, name);
      // User state will be updated by onAuthStateChange listener
      // Note: If email confirmation is enabled, user might not be logged in immediately
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isDemoMode) {
      setError('Google Login is disabled in Demo Mode.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const authUrl = await authService.getGoogleAuthUrl();
      if (!authUrl) throw new Error('Failed to get Google Auth URL');

      // Open the Supabase Auth URL directly in a popup
      const authWindow = window.open(
        authUrl,
        'google_auth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      // Listen for the success message from the popup (callback page)
      const handleMessage = async (event: MessageEvent) => {
        // Validate origin is from AI Studio preview or localhost
        const origin = event.origin;
        if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
          return;
        }

        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          console.log('useAuth: OAuth success message received from popup');
          window.removeEventListener('message', handleMessage);
          
          // Explicitly refresh the session to ensure the main window has the latest state
          // We'll try a few times with a small delay as it might take a moment for localStorage to sync
          const refreshSession = async (retries = 5) => {
            try {
              console.log(`useAuth: Refreshing session, retries left: ${retries}`);
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                console.log('useAuth: User found after refresh:', session.user.email);
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.full_name || '',
                });
                setLoading(false);
                router.push('/');
                return true;
              }
            } catch (err) {
              console.error('useAuth: Failed to refresh session after OAuth:', err);
            }

            if (retries > 0) {
              console.log('useAuth: No user found, retrying in 500ms...');
              setTimeout(() => refreshSession(retries - 1), 500);
              return false;
            } else {
              console.log('useAuth: No user found after all retries');
              setLoading(false);
              router.push('/');
              return false;
            }
          };

          refreshSession();
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setUser(null);
        localStorage.removeItem('demo_user');
        router.push('/auth');
        return;
      }
      await authService.signOut();
      setUser(null);
      router.push('/auth');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, error, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
