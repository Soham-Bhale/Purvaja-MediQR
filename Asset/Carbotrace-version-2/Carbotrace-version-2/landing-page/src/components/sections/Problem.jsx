import { XCircle, CheckCircle, Warning, Clock, TrendUp, ShieldCheck } from '@phosphor-icons/react';

export function Problem() {
  return (
    <section id="problem" className="py-20 md:py-28 bg-[#fafafa] dark:bg-[#09090b] transition-colors" aria-label="The problem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.15] mb-4">
            Code linting ends at formatting. <br />
            Cloud billing starts after deployment.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every git commit initiates computational cycles across test runners, container registries, and regional datacenters. Today, engineers have zero visibility into their software emissions before merge.
          </p>
        </div>

        {/* Asymmetric 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Core Friction Points */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 border border-amber-200/60 dark:border-amber-800/60">
                <Warning size={20} weight="fill" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Linters check style, not joules</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Standard linters verify indentation and quotes, but remain blind to algorithmic bottlenecks like unindexed queries and $O(N^2)$ iterations that waste server CPU cycles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold mb-3 border border-red-200/60 dark:border-red-800/60">
                <Clock size={20} weight="fill" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Redundant CI/CD runner burn</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Automated test matrices and container builds run on every branch push without caching checks, burning hundreds of kilowatt-hours on unnecessary duplicate compute.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3 border border-purple-200/60 dark:border-purple-800/60">
                <TrendUp size={20} weight="fill" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Invoices arrive after damage is done</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                FinOps and cloud billing platforms deliver monthly summaries weeks after carbon emissions have already entered the atmosphere. Optimization must happen at the pull request.
              </p>
            </div>
          </div>

          {/* Right Column: Comparison Card (Legacy vs Carbotrace) */}
          <div className="lg:col-span-7 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <div>
                  <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                    Workflow Comparison
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">From reactive bills to proactive gates</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Pre-Merge GreenOps
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                {/* Legacy Workflow */}
                <div className="space-y-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                  <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-semibold uppercase">
                    <XCircle size={16} weight="fill" />
                    <span>Traditional Workflow</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>Algorithmic bloat merged without computational intensity review.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>CI test runners execute without layer cache optimization.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>Cloud regions selected without regional grid carbon awareness.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>Emissions tallied retrospectively via quarterly ESG estimates.</span>
                    </li>
                  </ul>
                </div>

                {/* Carbotrace Workflow */}
                <div className="space-y-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase">
                    <CheckCircle size={16} weight="fill" />
                    <span>With Carbotrace</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span>AST analysis catches energy-intensive syntax during coding.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span>Automated PR bot posts carbon delta and blocks regressions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span>IaC templates correlated with live datacenter grid PUE factors.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span>Zero-data-leakage local Ollama AI provides instant code refactors.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Takeaway Metric */}
            <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono border border-emerald-500/20">
                  -82%
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Average CPU cycle reduction</div>
                  <div className="text-[11px] text-zinc-500">Achieved across tested open source repositories</div>
                </div>
              </div>
              <a
                href="#hero-scan"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
              >
                <span>Audit your repo now</span>
                <span className="transition-transform group-hover:translate-x-0.5">-&gt;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
