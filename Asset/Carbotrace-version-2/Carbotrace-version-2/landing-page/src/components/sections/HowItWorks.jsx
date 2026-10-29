import { useState } from 'react';
import {
  MagnifyingGlass,
  GitFork,
  Cpu,
  ShieldCheck,
  Check,
  ArrowRight,
  TerminalWindow,
  GitPullRequest,
  Sparkle,
} from '@phosphor-icons/react';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: 'Scan any public repository',
      subtitle: 'Zero SDK installation or production agent needed',
      description:
        'Paste any public GitHub repository link or connect your private organization with read-only permissions. Carbotrace performs an instant deep AST tree analysis in seconds.',
      icon: MagnifyingGlass,
    },
    {
      id: 1,
      title: 'Inspect 3-layer carbon telemetry',
      subtitle: 'From algorithmic complexity to cloud grid PUE',
      description:
        'Carbotrace correlates code syntax bottlenecks ($O(N^2)$ loops, memory leaks), CI/CD runner execution duration, and regional data center electricity coefficients.',
      icon: Cpu,
    },
    {
      id: 2,
      title: 'Enforce automated PR merge gates',
      subtitle: 'Stop carbon regressions before production deploys',
      description:
        'Add the official Carbotrace GitHub Action to your repository. Block pull requests that cause carbon spikes and receive automated refactor patches directly in PR comments.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/70 dark:border-zinc-800/80 transition-colors" aria-label="How it works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.15] mb-4">
            How Carbotrace works in your daily workflow
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Engineered to fit into existing pull request review rituals without adding friction or slowing down deployment velocity.
          </p>
        </div>

        {/* 2-Column Interactive Step Switcher & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Step Selector */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-5 rounded-2xl transition-all border ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-800'
                      : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-zinc-950 dark:bg-zinc-800 text-emerald-400 font-bold border border-zinc-700/60'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon size={18} weight="bold" />
                    </div>
                    <div>
                      <h3
                        className={`text-base font-semibold transition-colors ${
                          isActive ? 'text-zinc-950 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-1.5">{step.subtitle}</div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: CleanShot-style Dynamic Interactive Preview Window */}
          <div className="lg:col-span-7 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 p-6 shadow-2xl min-h-95 flex flex-col justify-between">
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-2 text-xs font-mono text-zinc-400">
                  {activeStep === 0 && 'carbotrace scan --public'}
                  {activeStep === 1 && 'carbotrace analyze --layers 1,2,3'}
                  {activeStep === 2 && 'github-actions/carbotrace-gate@v2'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Live Stage Preview</span>
            </div>

            {/* Dynamic Stage Content */}
            <div className="py-6 flex-1 flex flex-col justify-center">
              {activeStep === 0 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs">
                    <div className="text-zinc-500">$ carbotrace clone --depth 1 https://github.com/facebook/react</div>
                    <div className="text-zinc-300">Cloning repository AST structures... [1,842 files parsed]</div>
                    <div className="text-emerald-400 flex items-center gap-1.5">
                      <Check size={14} weight="bold" />
                      <span>AST symbol graph constructed in 1.48 seconds</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      No code executed. Static syntax analysis only via tree-sitter C-bindings.
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-400 text-[11px]">Layer 1 AST Static Scan</div>
                      <div className="text-emerald-400 font-bold">2 antipatterns flagged (-64% CPU fix)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                      Evaluated
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-400 text-[11px]">Layer 2 CI/CD Runner Minutes</div>
                      <div className="text-blue-400 font-bold">3m 48s build duration (28.4 Wh)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px] border border-blue-800">
                      Evaluated
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-400 text-[11px]">Layer 3 Regional Grid Emission Factor</div>
                      <div className="text-purple-400 font-bold">AWS eu-central-1: 312 gCO2e/kWh</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 text-[10px] border border-purple-800">
                      Evaluated
                    </span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        C
                      </div>
                      <span className="text-xs font-semibold text-white">carbotrace-audit[bot] checked PR #142</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Gate Passed
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Base commit:</span>
                      <span>38.2 gCO2e</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Head commit:</span>
                      <span className="text-emerald-400">31.4 gCO2e (-17.8%)</span>
                    </div>
                    <div className="pt-1 text-emerald-400 text-[11px]">
                      ✓ Carbon delta within safe threshold (+0.05 max allowed). Merge approved.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Step Indicator */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      activeStep === i ? 'bg-emerald-400' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <a href="#hero-scan" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Try this with your repository</span>
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
