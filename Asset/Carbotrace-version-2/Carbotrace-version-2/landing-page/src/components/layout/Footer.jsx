import { GithubLogo, Sparkle, Heart } from '@phosphor-icons/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-zinc-900">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400 border border-zinc-800">
                <Sparkle size={16} weight="fill" />
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">Carbotrace</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              The open-source software carbon intelligence platform. Measure, audit, and optimize carbon intensity across AST syntax, CI/CD runners, and cloud infrastructure.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>All telemetry pipelines active</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  AST Static Analysis
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  GitHub PR Merge Gate
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Regional Grid Telemetry
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Local Ollama AI
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Dependency Carbon Cache
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://tree-sitter.github.io" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  tree-sitter Engine
                </a>
              </li>
              <li>
                <a href="https://fastapi.tiangolo.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  FastAPI Async Core
                </a>
              </li>
              <li>
                <a href="https://www.timescale.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  TimescaleDB Series
                </a>
              </li>
              <li>
                <a href="https://ollama.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  qwen2.5-coder Model
                </a>
              </li>
              <li>
                <a href="#problem" className="hover:text-emerald-400 transition-colors">
                  SCI Carbon Formulae
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-4">Open Source</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/DChitale/Carbotrace"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <GithubLogo size={16} />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/DChitale/Carbotrace/blob/main/LICENSE" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  MIT License
                </a>
              </li>
              <li>
                <a href="https://github.com/DChitale/Carbotrace/issues" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  Issue Tracker
                </a>
              </li>
              <li>
                <a href="https://github.com/DChitale/Carbotrace/discussions" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  Discussions
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Documentation FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <span>Built with care for green computing. Released under the MIT License.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Copyright {currentYear} Carbotrace Contributors</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
