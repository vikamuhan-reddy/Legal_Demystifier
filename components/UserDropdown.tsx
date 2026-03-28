import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface UserDropdownProps {
  showLogout: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ showLogout }) => {
  const { user, logout, isDemoMode } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border",
          isOpen 
            ? "bg-secondary border-border/40 shadow-inner" 
            : "bg-transparent border-transparent hover:bg-secondary/50 hover:border-border/10"
        )}
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden shadow-sm">
          {user.name ? getInitials(user.name) : <User size={14} />}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-[10px] font-bold leading-none mb-0.5 truncate max-w-[100px]">
            {user.name || 'User'}
          </span>
          <span className="text-[8px] font-medium text-muted-foreground/60 leading-none">
            {isDemoMode ? 'Demo Account' : 'Pro Member'}
          </span>
        </div>
        <ChevronDown 
          size={12} 
          className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 bg-background border border-border/40 rounded-2xl shadow-2xl overflow-hidden z-[100]"
          >
            {/* User Header */}
            <div className="p-4 bg-secondary/10 border-b border-border/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20">
                  {user.name ? getInitials(user.name) : <User size={18} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[11px] font-bold truncate">{user.name || 'User'}</p>
                  <p className="text-[9px] font-medium text-muted-foreground/60 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/50 border border-border/10">
                <Shield size={10} className="text-primary/40" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Verified Account
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
              >
                <Settings className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                Profile Settings
              </button>
              
              <button
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
              >
                <Mail className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                Notifications
              </button>

              <div className="h-px bg-border/10 my-1 mx-2" />
              
              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] text-destructive/60 hover:bg-destructive/5 hover:text-destructive transition-all group"
                >
                  <LogOut className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  Sign Out
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-secondary/5 border-t border-border/10 text-center">
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                LegalDemystifier v3.0.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
