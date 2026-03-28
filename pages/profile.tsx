import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';

export default function ProfilePage() {
  const { user, loading, updateProfile, logout, isDemoMode } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
    if (user) {
      setName(user.name || '');
    }
  }, [user, loading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    setStatus(null);

    try {
      await updateProfile(name);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background font-sans transition-colors duration-500", theme)}>
      <Head>
        <title>Profile | Legal Document Demystifier</title>
      </Head>

      <Header 
        onNewChat={() => router.push('/')} 
        onToggleHistory={() => {}} 
        onToggleSidebar={() => {}} 
      />

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/40 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/20">
            <div className="absolute -bottom-12 left-8">
              <div className="h-24 w-24 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center text-primary overflow-hidden">
                {isDemoMode ? (
                  <ShieldCheck className="h-10 w-10 opacity-20" />
                ) : (
                  <User className="h-10 w-10 opacity-20" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight mb-1">
                  {user.name || 'User Profile'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account settings and profile information.
                </p>
              </div>
              
              {isDemoMode && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                  Demo Mode
                </div>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full h-12 pl-12 pr-4 bg-secondary/30 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Email Address
                  </label>
                  <div className="relative opacity-60 cursor-not-allowed">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full h-12 pl-12 pr-4 bg-secondary/10 border border-border/20 rounded-xl text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 ml-1 italic">
                    Email cannot be changed for security reasons.
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {status && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border text-xs font-medium",
                      status.type === 'success' 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    )}
                  >
                    {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-4">
                <motion.button
                  type="submit"
                  disabled={isUpdating || name === user.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 h-11 px-8 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                    isUpdating && "animate-pulse"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Update Profile
                </motion.button>

                <button
                  type="button"
                  onClick={logout}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive/60 hover:text-destructive transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-secondary/20 border border-border/20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your data is encrypted and stored securely in our Supabase backend. We use industry-standard OAuth 2.0 and JWT for authentication.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-secondary/20 border border-border/20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We do not share your personal information or analyzed documents with third parties. Your history is private to your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
