import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { supabaseService } from '../services/supabaseService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// Initialize auth state from session
const initializeAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      console.log('Attempting to sign in with:', { email });
      
      const { user } = await supabaseService.signIn(email, password);
      
      console.log('Sign in successful:', user);
      set({ user, loading: false });
    } catch (error) {
      console.error('Auth store error:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await supabaseService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  setUser: (user) => set({ user }),
}));

// Initialize auth state
initializeAuth().then((user) => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().loading = false;
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
}); 