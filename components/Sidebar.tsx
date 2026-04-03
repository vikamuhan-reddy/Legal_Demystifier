import React from 'react';
import { 
  FileText, 
  Layout, 
  Tag, 
  Key, 
  AlertTriangle, 
  MessageSquare, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  LogIn,
  User
} from 'lucide-react';
import { OutputTab } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface SidebarProps {
  activeTab: OutputTab;
  setActiveTab: (tab: OutputTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewAnalysis: () => void;
}

const SidebarItem: React.FC<{
  tab: OutputTab;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ tab, icon, isActive, isCollapsed, onClick }) => (
  <motion.button
    whileHover={{ x: isCollapsed ? 0 : 2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
      isActive 
        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" 
        : "text-muted-foreground/60 hover:bg-secondary/50 hover:text-foreground",
      isCollapsed && "md:justify-center md:px-0"
    )}
    title={isCollapsed ? tab : undefined}
  >
    <div className={cn(
      "shrink-0 transition-all duration-300", 
      isActive ? "scale-110" : "group-hover:scale-110"
    )}>
      {React.cloneElement(icon as React.ReactElement, { size: 14 })}
    </div>
    <span className={cn(
      "text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300",
      isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100",
      isCollapsed && "md:hidden"
    )}>
      {tab}
    </span>
  </motion.button>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed,
  isOpen,
  onClose,
  onNewAnalysis
}) => {
  const menuItems = [
    { tab: OutputTab.SUMMARY, icon: <FileText size={16} /> },
    { tab: OutputTab.STRUCTURE, icon: <Layout size={16} /> },
    { tab: OutputTab.ENTITIES, icon: <Tag size={16} /> },
    { tab: OutputTab.CLAUSES, icon: <Key size={16} /> },
    { tab: OutputTab.RISKS, icon: <AlertTriangle size={16} /> },
    { tab: OutputTab.FAQ, icon: <HelpCircle size={16} /> },
    { tab: OutputTab.CHAT, icon: <MessageSquare size={16} /> },
  ];

  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={cn(
          "fixed left-0 top-16 md:top-20 bottom-0 z-50 bg-background border-r border-border/40 transition-all duration-300 flex flex-col md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        )}
      >
        {(!isCollapsed || isOpen) && (
          <div className="px-6 py-5 border-b border-border/20 flex items-center justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Navigation</p>
            <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
              <Plus className="rotate-45 h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-grow py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.tab}
              tab={item.tab}
              icon={item.icon}
              isActive={activeTab === item.tab}
              isCollapsed={isCollapsed && !isOpen}
              onClick={() => setActiveTab(item.tab)}
            />
          ))}
        </div>

        <div className="p-3 border-t border-border/20 space-y-2 bg-secondary/10">
          {user && (
            <Link href="/profile" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.01, x: (isCollapsed && !isOpen) ? 0 : 2 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground group cursor-pointer",
                  isCollapsed && !isOpen && "md:justify-center md:px-0"
                )}
                title={isCollapsed && !isOpen ? "Profile" : undefined}
              >
                <div className="shrink-0 transition-transform group-hover:scale-105">
                  <User size={16} />
                </div>
                {(!isCollapsed || isOpen) && <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Profile</span>}
              </motion.a>
            </Link>
          )}

          {user ? (
            <motion.button
              whileHover={{ scale: 1.01, x: (isCollapsed && !isOpen) ? 0 : 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={logout}
              className={cn(
                "flex items-center gap-4 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-destructive hover:bg-destructive/5 group",
                isCollapsed && !isOpen && "md:justify-center md:px-0"
              )}
              title={isCollapsed && !isOpen ? "Logout" : undefined}
            >
              <div className="shrink-0 transition-transform group-hover:scale-105">
                <LogOut size={16} />
              </div>
              {(!isCollapsed || isOpen) && <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Logout</span>}
            </motion.button>
          ) : (
            <Link href="/auth" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.01, x: (isCollapsed && !isOpen) ? 0 : 2 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-primary hover:bg-primary/5 group cursor-pointer",
                  isCollapsed && !isOpen && "md:justify-center md:px-0"
                )}
                title={isCollapsed && !isOpen ? "Login" : undefined}
              >
                <div className="shrink-0 transition-transform group-hover:scale-105">
                  <LogIn size={16} />
                </div>
                {(!isCollapsed || isOpen) && <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Login</span>}
              </motion.a>
            </Link>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onNewAnalysis}
            className={cn(
              "flex items-center gap-4 w-full px-4 py-4 rounded-2xl transition-all duration-300 bg-primary text-primary-foreground shadow-xl shadow-primary/10 hover:bg-primary/90",
              isCollapsed && !isOpen && "md:justify-center md:px-0"
            )}
            title={isCollapsed && !isOpen ? "New Analysis" : undefined}
          >
            <Plus size={16} className="shrink-0" />
            {(!isCollapsed || isOpen) && <span className="text-[10px] font-bold uppercase tracking-[0.2em]">New Analysis</span>}
          </motion.button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden md:flex items-center gap-4 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground group",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className="shrink-0 transition-transform group-hover:scale-105">
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </div>
            {!isCollapsed && <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
