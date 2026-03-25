import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Lock, 
  Sparkles,
  ChevronRight,
  Star,
  Quote,
  Github,
  Scale,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const features = [
    {
      icon: <Shield size={24} />,
      title: "Risk Detection",
      description: "Automatically identify potential liabilities, hidden clauses, and unfavorable terms in seconds."
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Summaries",
      description: "Get a clear, plain-English breakdown of complex legal jargon without losing critical context."
    },
    {
      icon: <Search size={24} />,
      title: "Deep Analysis",
      description: "Our AI dives deep into document structure to extract parties, dates, and financial obligations."
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Legal AI Chat",
      description: "Ask specific questions about your document and get immediate, context-aware answers."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Startup Founder",
      content: "Demystifier saved us thousands in legal review fees. It caught a non-compete clause we completely missed.",
      avatar: "SJ"
    },
    {
      name: "David Chen",
      role: "Real Estate Agent",
      content: "I use it for every lease agreement. It gives my clients peace of mind and speeds up the closing process.",
      avatar: "DC"
    },
    {
      name: "Elena Rodriguez",
      role: "Freelance Designer",
      content: "Finally, I can understand my client contracts without a law degree. Simple, fast, and incredibly accurate.",
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Scale size={20} />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">LegalDemystifier</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12">
            <a href="#features" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 hover:text-foreground transition-colors">Analysis</a>
            <a href="#testimonials" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 hover:text-foreground transition-colors">Impact</a>
          </div>

          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground border border-border/10"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            <Link href="/auth" prefetch={false} className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">Log In</Link>
            <Link 
              href="/auth" 
              prefetch={false}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-56 pb-20 md:pb-40 overflow-hidden border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-primary text-[9px] font-bold uppercase tracking-[0.3em] mb-8 border border-border/20">
                  <Sparkles size={12} />
                  <span>AI-Driven Legal Intelligence</span>
                </div>
                
                <h1 className="text-5xl sm:text-7xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tighter mb-10">
                  Clarity in <br />
                  <span className="italic text-muted-foreground/60">Complexity.</span>
                </h1>
                
                <p className="max-w-xl text-lg md:text-xl text-muted-foreground/80 font-medium leading-relaxed mb-12">
                  Professional-grade document analysis that transforms dense legal jargon into clear, actionable intelligence. Built for those who demand precision.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Link 
                    href="/auth" 
                    prefetch={false}
                    className="group px-10 py-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center gap-4 shadow-2xl shadow-primary/20"
                  >
                    Start Analysis
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a 
                    href="#demo" 
                    className="px-10 py-5 rounded-full bg-transparent border border-border/30 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-secondary/50 transition-all"
                  >
                    View Capabilities
                  </a>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-border/20 shadow-2xl"
              >
                <Image 
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1600&auto=format&fit=crop" 
                  alt="Legal Professional" 
                  fill
                  priority
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 opacity-80 hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-background/90 backdrop-blur-xl rounded-2xl border border-border/20 shadow-xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Real-time Insight</p>
                  <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">&quot;The AI identified a critical liability gap in Section 8 that our team missed.&quot;</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-48 border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-7xl font-serif font-medium tracking-tight mb-8 leading-tight">Engineered for Precision</h2>
              <p className="text-lg md:text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Our suite of analysis tools provides a comprehensive overview of any legal document, ensuring no detail is overlooked.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-24 w-24 rounded-full border border-border/20 flex items-center justify-center animate-spin-slow">
                <div className="h-2 w-2 rounded-full bg-primary/40" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/10 border border-border/10 rounded-3xl overflow-hidden">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-12 bg-background hover:bg-secondary/20 transition-all group"
              >
                <div className="text-primary/40 mb-10 group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-serif font-medium mb-6">{feature.title}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 md:py-48 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-full border border-border/20 p-12 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-primary/10 p-12 flex items-center justify-center">
                  <div className="w-full h-full bg-background rounded-3xl border border-border/20 shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border/10 flex items-center justify-between bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Active Analysis</span>
                      </div>
                      <div className="h-4 w-4 rounded-full bg-border/20" />
                    </div>
                    <div className="flex-1 p-8 space-y-8 overflow-hidden">
                      <div className="space-y-3">
                        <div className="h-2 w-3/4 bg-secondary/50 rounded-full" />
                        <div className="h-2 w-1/2 bg-secondary/50 rounded-full" />
                      </div>
                      <div className="p-6 bg-primary/5 border-l-2 border-primary/40 rounded-r-xl">
                        <p className="text-xs font-serif italic leading-relaxed text-foreground/70">&quot;Detected non-standard indemnification clause in Section 14.3. Risk level: High.&quot;</p>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 w-full bg-secondary/50 rounded-full" />
                        <div className="h-2 w-2/3 bg-secondary/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-7xl font-serif font-medium tracking-tight mb-12 leading-tight">
                Unprecedented <br />
                <span className="italic text-muted-foreground/60">Visibility.</span>
              </h2>
              <div className="space-y-10">
                {[
                  { title: "Automated Triage", desc: "Instantly categorize documents by risk and priority." },
                  { title: "Semantic Search", desc: "Find specific obligations across thousands of pages." },
                  { title: "Interactive Assistant", desc: "Query your documents in natural language." }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <h4 className="text-xl font-serif font-medium mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-16">
                <Link 
                  href="/auth" 
                  prefetch={false}
                  className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:gap-6 transition-all"
                >
                  Start Free Trial
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-48 border-y border-border/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-7xl font-serif font-medium tracking-tight mb-8">Industry Perspective</h2>
            <div className="h-px w-24 bg-primary/20 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col"
              >
                <Quote size={40} className="text-primary/5 mb-8" />
                <p className="text-xl font-serif italic leading-relaxed mb-10 flex-1 text-foreground/80">&quot;{t.content}&quot;</p>
                <div className="flex items-center gap-4 pt-8 border-t border-border/10">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center font-bold text-[10px] uppercase tracking-wider border border-border/20">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">{t.name}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-48 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-8xl font-serif font-medium tracking-tighter leading-[0.9] mb-12">
            Elevate Your <br />
            <span className="italic opacity-40">Legal Workflow.</span>
          </h2>
          <p className="text-lg md:text-xl opacity-70 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
            Join the elite professionals who leverage AI to maintain a competitive edge in document analysis.
          </p>
          <Link 
            href="/auth" 
            prefetch={false}
            className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-background text-primary text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-background/90 transition-all shadow-2xl"
          >
            Get Started Now
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white blur-[120px] rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-background border-t border-border/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-6">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <Scale size={20} />
                </div>
                <span className="text-2xl font-serif font-bold tracking-tight">LegalDemystifier</span>
              </div>
              <p className="text-muted-foreground/60 font-medium max-w-md leading-relaxed text-lg">
                The standard in AI-driven legal intelligence. Providing clarity and precision for the modern professional.
              </p>
            </div>
            
            <div className="md:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-foreground/80">Capabilities</h4>
              <ul className="space-y-6 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
                <li><a href="#features" className="hover:text-primary transition-colors">Analysis Engine</a></li>
                <li><a href="#demo" className="hover:text-primary transition-colors">Risk Detection</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Semantic Search</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Access</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-foreground/80">Resources</h4>
              <ul className="space-y-6 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-border/10">
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
              © 2026 LegalDemystifier Intelligence. All rights reserved.
            </p>
            <div className="flex items-center gap-10">
              <a href="#" className="text-muted-foreground/40 hover:text-primary transition-colors"><Github size={18} /></a>
              <a href="#" className="text-muted-foreground/40 hover:text-primary transition-colors"><Star size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
