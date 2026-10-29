import { useState, useEffect } from 'react';
import { GithubLogo, ArrowRight, List, X, Sparkle } from '@phosphor-icons/react';
import { ThemeToggle } from '../common/ThemeToggle';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'glass-nav py-3' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-900 flex items-center justify-center text-emerald-400 border border-zinc-800 shadow-sm transition-transform group-hover:scale-105">
              <Sparkle size={18} weight="fill" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">Carbotrace</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                OSS
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#problem" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Why Carbotrace
            </a>
            <a href="#how-it-works" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              FAQ
            </a>
            <a
              href="https://github.com/DChitale/Carbotrace"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <GithubLogo size={16} weight="bold" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <a
              href="https://github.com/DChitale/Carbotrace"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/80 transition-all flex items-center gap-1.5"
            >
              <span>★ Star on GitHub</span>
              <span className="text-zinc-400 dark:text-zinc-500">|</span>
              <span className="font-semibold text-zinc-900 dark:text-white">v2.0</span>
            </a>

            <a
              href="#hero-scan"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-zinc-950 dark:bg-emerald-500 dark:text-zinc-950 hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all shadow-sm flex items-center gap-1 group active:scale-[0.98]"
            >
              <span>Scan Repository</span>
              <ArrowRight size={12} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl flex flex-col gap-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Features
            </a>
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Why Carbotrace
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
              <a
                href="#hero-scan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-full text-xs font-semibold text-white bg-zinc-950 dark:bg-emerald-500 dark:text-zinc-950"
              >
                Scan Repository
              </a>
              <a
                href="https://github.com/DChitale/Carbotrace"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-2 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2"
              >
                <GithubLogo size={16} />
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
