import React from 'react';
import { Twitter, Mail, ExternalLink, Send, Globe, Award, CheckSquare, Square, LogIn, LogOut, User as UserIcon, Sparkles, Layout, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useSkar } from '../../context/BlobContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Custom Icon: World with waves inside
const WorldWavesIcon = () => (
  <div className="relative w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden">
    <Globe size={24} className="text-[#00d2ff]/60 absolute" />
    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-[#00d2ff] stroke-[1.5] relative z-10 mt-1">
      <path d="M2 12c3-2 6 2 9 0s6-2 9 0" />
      <path d="M2 16c3-2 6 2 9 0s6-2 9 0" />
    </svg>
  </div>
);

// Product Hunt Badge Component
const ProductHuntBadge = () => (
  <a 
    href="https://www.producthunt.com/products/blobmaker" 
    target="_blank" 
    className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-2xl hover:bg-white/60 transition-all w-fit my-6 shadow-sm"
  >
    <div className="bg-[#FF6154]/20 p-2 rounded-xl border border-[#FF6154]/30">
      <Award size={20} className="text-[#FF6154]" />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-80">Featured on Product Hunt</span>
      <span className="text-sm font-black text-slate-800">#1 Product of The Day</span>
    </div>
  </a>
);

const SkarglassLogo = () => (
  <div className="relative w-14 h-14 flex items-center justify-center group">
    {/* Glass Blade Shape */}
    <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl border border-white/80 rounded-tr-[2rem] rounded-bl-[2rem] rotate-[30deg] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform group-hover:rotate-[40deg] duration-700 overflow-hidden">
      {/* Light Reflection/Highlight */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-r from-transparent via-white/70 to-transparent rotate-45 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      {/* Inner Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </div>
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-95 pointer-events-none drop-shadow-xl">
      <defs>
        <linearGradient id="bladeRefraction" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F39C34" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D74463" stopOpacity="0.9" />
        </linearGradient>
        <filter id="glassRefraction">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <path 
        d="M30,10 L90,30 L70,90 L10,70 Z" 
        fill="url(#bladeRefraction)"
        className="rotate-[15deg] origin-center"
        filter="url(#glassRefraction)"
      />
    </svg>
    {/* Inner Blade Edge Highlight */}
    <div className="absolute top-2 right-2 w-1 h-8 bg-white/90 blur-[0.5px] rounded-full rotate-[30deg]" />
  </div>
);

const STYLES: { id: any; icon: any; label: string }[] = [
  { id: 'minimalism', icon: Layout, label: 'Minimalism' },
  { id: 'glassmorphism', icon: Sparkles, label: 'Glassmorfismo' },
  { id: 'minimalist', icon: Moon, label: 'Minimalista' },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const { user, signIn, signOut, loading } = useAuth();
  const { styleMode, setStyleMode } = useSkar();

  const getStyleClasses = () => {
    switch (styleMode) {
      case 'minimalism':
        return {
          bg: 'bg-[#f8fafc]',
          card: 'bg-white border-slate-200 shadow-sm',
          text: 'text-slate-900',
          blobs: 'opacity-0',
          noise: 'opacity-0',
          logo: 'text-slate-900',
          footerText: 'text-slate-600',
          footerHeading: 'text-slate-900'
        };
      case 'minimalist':
        return {
          bg: 'bg-slate-950',
          card: 'bg-slate-900 border-slate-800 shadow-2xl',
          text: 'text-white',
          blobs: 'opacity-20 mix-blend-overlay',
          noise: 'opacity-10',
          logo: 'text-white',
          footerText: 'text-white/70',
          footerHeading: 'text-white'
        };
      case 'glassmorphism':
      default:
        return {
          bg: 'bg-[#fcfcfd]',
          card: 'bg-white/40 backdrop-blur-3xl border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
          text: 'text-slate-900',
          blobs: 'opacity-100',
          noise: 'opacity-[0.03]',
          logo: 'text-slate-900',
          footerText: 'text-slate-600',
          footerHeading: 'text-slate-900'
        };
    }
  };

  const styles = getStyleClasses();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-700 relative overflow-x-hidden ${styles.bg} ${styles.text}`}>
      {/* Dynamic Background Blobs for Glassmorphism depth */}
      <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${styles.blobs}`}>
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#F39C34]/8 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-[15%] -right-[10%] w-[45%] h-[45%] bg-[#D74463]/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[15%] w-[40%] h-[40%] bg-[#F39C34]/5 blur-[100px] rounded-full" />
        {/* Grain Overlay */}
        <div className={`absolute inset-0 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-700 ${styles.noise}`} />
      </div>

      {/* Top Glass Bar */}
      <div className="h-32 w-full bg-white/30 backdrop-blur-3xl border-b border-white/40 relative z-30 flex items-end pb-6 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F39C34]/5 via-[#D74463]/5 to-[#F39C34]/5 opacity-20" />
      </div>

      {/* Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 h-32 flex justify-between items-center relative z-40 -mt-32">
        <div className="flex items-center gap-6 group cursor-pointer">
          <SkarglassLogo />
          <div className="flex flex-col">
            <span className={`font-black text-3xl tracking-tighter drop-shadow-md uppercase transition-transform group-hover:scale-105 duration-300 ${styles.logo}`}>
              Skarglass
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">Make Your Skar</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 p-2 bg-white/50 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-xl shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center">
                    <UserIcon size={16} className="text-slate-400" />
                  </div>
                )}
                <span className="text-xs font-black text-slate-700 pr-2 hidden md:block">{user.displayName}</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-3 bg-white/50 backdrop-blur-2xl border border-white/60 rounded-2xl text-slate-500 hover:text-red-500 transition-all hover:scale-110 shadow-lg"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn()}
              className="flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-2xl border border-white/60 rounded-2xl text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-white/70 transition-all hover:scale-105 shadow-lg"
            >
              <LogIn size={18} /> Sign In
            </button>
          )}

          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-white/50 backdrop-blur-2xl border border-white/60 rounded-2xl text-slate-500 hover:text-[#1DA1F2] transition-all hover:scale-110 shadow-lg"
          >
            <Twitter size={24} />
          </a>
        </div>
      </header>

      {/* Visual Style Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 relative z-40 mb-12">
        <div className="flex items-center justify-center gap-16 py-6 border-b border-white/10">
          {STYLES.map((s) => {
            const Icon = s.icon;
            const isActive = styleMode === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStyleMode(s.id)}
                className={`flex flex-col items-center gap-3 transition-all duration-500 group relative ${isActive ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60'}`}
              >
                <div className={`p-4 rounded-2xl transition-all duration-500 ${isActive ? 'bg-slate-900 text-white shadow-2xl' : 'bg-transparent'}`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {s.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeStyle"
                    className="absolute -bottom-6 w-1 h-1 bg-slate-900 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        <div className={`w-full max-w-5xl rounded-[3rem] border p-8 md:p-16 min-h-[600px] flex flex-col relative overflow-hidden transition-all duration-700 ${styles.card}`}>
          {children}
        </div>
      </main>

      {/* Footer / Info Section */}
      <footer className={`w-full max-w-7xl mx-auto px-6 pt-24 pb-48 flex flex-col gap-20 relative z-10 transition-colors duration-700 ${styles.footerText}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Skarglass + Description + Newsletter */}
          <div className={`flex flex-col gap-12 p-8 border rounded-[2.5rem] shadow-sm transition-all duration-700 ${styles.card}`}>
            <div className="flex flex-col gap-6">
              <h2 className={`text-4xl font-black tracking-tighter ${styles.footerHeading}`}>Skarglass</h2>
              <div className="flex flex-col gap-5 text-base leading-relaxed font-medium">
                <p>
                  Experience the future of organic design. Skarglass transforms random data into ethereal, glass-like forms that redefine digital aesthetics.
                </p>
                
                <ProductHuntBadge />

                <p className="text-sm opacity-80">
                  Refine complexity and contrast to sculpt your unique glass masterpiece. Export instantly as high-fidelity SVG.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full">
              <h2 className={`text-2xl font-bold ${styles.footerHeading}`}>Newsletter</h2>
              <div className="flex flex-col gap-4 w-full">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className={`w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#D74463]/10 focus:border-[#D74463]/40 transition-all placeholder:text-slate-400 ${styleMode === 'minimalist' ? 'text-slate-900' : ''}`}
                />
                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-black/10">
                  Subscribe <Send size={18} />
                </button>
                
                <div 
                  className="flex items-start gap-3 cursor-pointer group mt-1"
                  onClick={() => setIsSubscribed(!isSubscribed)}
                >
                  <div className="mt-0.5 text-[#D74463]">
                    {isSubscribed ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <span className="text-xs leading-tight font-medium transition-colors">
                    Send me updates about Skarglass products
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 2: More Products */}
          <div className="flex flex-col gap-8">
            <h3 className={`text-2xl font-bold text-center md:text-left px-4 ${styles.footerHeading}`}>More products</h3>
            
            <div className="flex flex-col gap-6">
              {/* GetWaves Card */}
              <div className={`flex items-center gap-6 border rounded-[2rem] p-8 shadow-sm hover:translate-y-[-4px] transition-all duration-700 ${styles.card}`}>
                <div className="shrink-0">
                  <WorldWavesIcon />
                </div>
                <p className="text-sm leading-relaxed font-medium">
                  Love SVG generators? Explore <a href="https://getwaves.io" target="_blank" className="text-[#00d2ff] font-bold hover:underline">getwaves.io</a> for stunning wave transitions.
                </p>
              </div>

              {/* Geo Quiz Card */}
              <div className={`flex items-center gap-6 border rounded-[2rem] p-8 shadow-sm hover:translate-y-[-4px] transition-all duration-700 ${styles.card}`}>
                <div className="p-3 bg-white/50 rounded-2xl">
                  <Globe size={32} className="text-[#D74463]" />
                </div>
                <p className="text-sm leading-relaxed font-medium">
                  Challenge your knowledge with our <a 
                    href="https://geography.games/europe-quiz/" 
                    target="_blank" 
                    className="text-[#D74463] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Geo Quiz <ExternalLink size={14} />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div className={`flex flex-col gap-8 md:items-end p-8 border rounded-[2.5rem] transition-all duration-700 ${styles.card}`}>
            <h2 className={`text-3xl font-bold ${styles.footerHeading}`}>Contact</h2>
            <div className="flex flex-col md:items-end gap-6">
              <p className="text-sm md:text-right max-w-[220px] font-medium leading-relaxed">
                Reach out for premium support or creative collaborations.
              </p>
              <a href="mailto:hello@zcreativelabs.com" className="flex items-center gap-3 p-4 bg-white/40 rounded-2xl hover:text-[#D74463] transition-all border border-white/60 font-semibold shadow-sm">
                <Mail size={20} />
                <span>hello@zcreativelabs.com</span>
              </a>
              <div className="flex items-center gap-4 mt-4">
                <a href="#" className="p-3 bg-white/40 rounded-xl text-slate-400 hover:text-[#1DA1F2] transition-all">
                  <Twitter size={22} />
                </a>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Bottom Glass Wave Decoration */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none">
        <div className="relative w-full">
          <svg viewBox="0 0 1440 320" className="w-full h-auto fill-white/20 backdrop-blur-3xl">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div className="absolute bottom-12 left-0 w-full flex justify-center">
            <span className={`text-sm font-bold tracking-widest uppercase transition-colors duration-700 ${styles.footerText}`}>
              © 2026 Skarglass
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
