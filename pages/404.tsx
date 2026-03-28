import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FileSearch, ArrowLeft, Home } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center font-sans">
      <Head>
        <title>404 - Page Not Found | Legal Document Demystifier</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="relative mb-12">
          <div className="h-32 w-32 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary/20 mx-auto border border-border/10">
            <FileSearch size={64} />
          </div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-background border border-border/30 shadow-xl flex items-center justify-center text-primary font-serif font-bold text-xl"
          >
            ?
          </motion.div>
        </div>

        <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter mb-6">
          404
        </h1>
        
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground">
            Document Not Found
          </h2>
          <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" passHref legacyBehavior>
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3"
            >
              <Home size={14} />
              Return Home
            </motion.a>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-secondary/50 text-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-secondary transition-all border border-border/10 flex items-center justify-center gap-3"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </motion.div>

      <div className="fixed bottom-12 left-0 w-full opacity-20 pointer-events-none">
        <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-muted-foreground text-center">
          LegalDemystifier Intelligence Engine
        </p>
      </div>
    </div>
  );
}
