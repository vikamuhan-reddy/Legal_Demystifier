import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // This page is opened in a popup during the Google OAuth flow.
    // It sends a message to the opener window and then closes itself.
    if (window.opener) {
      console.log('AuthCallback: Sending success message to opener...');
      window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
      window.close();
    } else {
      // Fallback if not in a popup
      console.log('AuthCallback: Not in a popup, redirecting to home...');
      router.replace('/');
    }
  }, [router]);

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
        Completing Authentication...
      </p>
    </div>
  );
}
