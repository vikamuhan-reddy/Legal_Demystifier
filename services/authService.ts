import { supabase } from '@/lib/supabaseClient';

export const authService = {
  /**
   * Sign up a new user with email and password.
   * Optionally includes metadata like 'name'.
   */
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log in an existing user with email and password.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Google OAuth using a popup-friendly flow.
   * Returns the URL to open in a popup.
   */
  async getGoogleAuthUrl() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    return data.url;
  },

  /**
   * Log out the current user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user.
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Update the current user's profile metadata.
   */
  async updateProfile(name: string) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
      },
    });

    if (error) throw error;
    return data.user;
  },

  /**
   * Listen for auth state changes.
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};
