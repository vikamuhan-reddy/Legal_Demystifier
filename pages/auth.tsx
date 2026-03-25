import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronLeft,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, login, signup, loginWithGoogle, error: authError, loading: authLoading, isDemoMode } = useAuth();
  const router = useRouter();
  
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  if (authLoading && !isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary/40 mb-6"
        >
          <Loader2 size={32} />
        </motion.div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 animate-pulse">
          {user ? 'Redirecting...' : 'Authenticating...'}
        </p>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        if (!name) throw new Error('Please enter your name');
        await signup(email, password, name);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Google');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <Head>
        <title>{authMode === 'login' ? 'Sign In' : 'Create Account'} | Legal Demystifier</title>
      </Head>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="absolute top-0 left-0 right-0 bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 z-[60] backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <AlertCircle size={14} className="text-amber-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
              Demo Mode Active: Supabase is not configured. Use test credentials to explore.
            </p>
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="absolute top-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 border border-border/20 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
      </div>

      {/* Logo / Back to Home */}
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all group"
      >
        <div className="h-8 w-8 rounded-lg bg-secondary/50 border border-border/20 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
          <ChevronLeft size={16} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary/10 border border-border/10 shadow-sm mb-6">
            <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary/20">
              <Lock size={18} />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground mb-3">
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-[280px] mx-auto">
            {authMode === 'login' 
              ? 'Sign in to access your secure workspace' 
              : 'Join us to start demystifying your legal documents'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-[2.5rem] border border-border/10 shadow-2xl shadow-primary/5 p-8 sm:p-10 backdrop-blur-sm">
          {/* Google Auth Button */}
          <motion.button 
            whileHover={isDemoMode ? {} : { scale: 1.02, y: -1 }}
            whileTap={isDemoMode ? {} : { scale: 0.98 }}
            type="button"
            onClick={handleGoogleLogin}
            disabled={isDemoMode}
            className={cn(
              "w-full flex items-center justify-center gap-4 h-14 rounded-2xl border border-border/10 bg-secondary/5 transition-all font-bold text-[11px] uppercase tracking-[0.2em] text-foreground shadow-sm mb-8",
              isDemoMode ? "opacity-50 cursor-not-allowed grayscale" : "hover:bg-secondary/10 hover:shadow-md"
            )}
          >
            <Chrome size={20} className="text-[#4285F4]" />
            {isDemoMode ? 'Google Login Disabled' : 'Continue with Google'}
          </motion.button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/10"></div>
            </div>
            <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-[0.3em]">
              <span className="bg-card px-4 text-muted-foreground/30">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary/40 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-secondary/5 border border-border/10 rounded-2xl text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary/40 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-secondary/5 border border-border/10 rounded-2xl text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Password</label>
                {authMode === 'login' && (
                  <Link href="#" className="text-[10px] font-bold uppercase tracking-wider text-primary/60 hover:text-primary transition-colors">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary/40 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-4 bg-secondary/5 border border-border/10 rounded-2xl text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            {isDemoMode && authMode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setEmail('test@demo.com');
                  setPassword('123456');
                }}
                className="w-full mt-4 py-3 rounded-xl border border-dashed border-amber-500/30 text-amber-500/60 hover:text-amber-500 hover:border-amber-500/50 transition-all text-[9px] font-bold uppercase tracking-[0.2em] bg-amber-500/5"
              >
                Use Test Credentials (test@demo.com / 123456)
              </button>
            )}
          </form>

          {/* Mode Toggle */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setLocalError(null);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {authMode === 'login' 
                ? "Don't have an account? Create one" 
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {displayError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider"
              >
                <AlertCircle size={14} className="shrink-0" />
                {displayError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legal */}
        <p className="mt-10 text-center text-[8px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em] px-8 leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="#" className="underline hover:text-muted-foreground transition-colors">Terms</Link>{' '}
          &{' '}
          <Link href="#" className="underline hover:text-muted-foreground transition-colors">Privacy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
