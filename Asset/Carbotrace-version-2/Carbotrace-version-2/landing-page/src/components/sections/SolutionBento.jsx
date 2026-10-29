import {
  Code,
  GitPullRequest,
  Globe,
  Cpu,
  Package,
  Sparkle,
  Check,
  Warning,
  ArrowRight,
  ShieldCheck,
  TerminalWindow,
} from '@phosphor-icons/react';

export function SolutionBento() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white dark:bg-[#09090b] border-t border-zinc-200/70 dark:border-zinc-800/80 transition-colors" aria-label="Core features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-mono mb-4 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold">
            <Sparkle size={13} weight="fill" />
            <span>3-Layer Intelligence Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.15] mb-4">
            Engineered down to the syntax tree
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Most carbon calculators multiply server costs by generic averages. Carbotrace parses actual source code tokens, runner execution minutes, and real-time regional grid factors.
          </p>
        </div>

        {/* 5-Cell Rhythmic Bento Grid (CleanShot-style asymmetric cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cell 1: AST Code Intelligence (2 cols) */}
          <div className="md:col-span-2 rounded-2xl bg-zinc-950 text-zinc-300 p-6 sm:p-8 border border-zinc-800/90 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Code size={16} weight="bold" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    Layer 1: Code Layer
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                  tree-sitter AST
                </span>
              </div>

              <div className="mt-4 mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Abstract Syntax Tree (AST) Static Analysis
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Deeply parses Python, JavaScript, and TypeScript source code to identify computational anti-patterns, memory leak vectors, and high-complexity iterations before code leaves the editor.
                </p>
              </div>

              {/* Code Audit Diff Window */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between text-zinc-500 pb-2 mb-2 border-b border-zinc-800/70">
                  <span className="text-zinc-300">services/scoring_engine.py</span>
                  <span className="text-red-400 flex items-center gap-1">
                    <Warning size={13} weight="fill" />
                    <span>Algorithmic Antipattern Flagged</span>
                  </span>
                </div>
                <div className="text-zinc-500"># Inefficient nested iteration detected</div>
                <div className="mt-1">
                  <span className="text-purple-400">for</span> item <span className="text-purple-400">in</span> dataset:
                </div>
                <div className="pl-4 my-1 p-1 rounded bg-red-950/40 border-l-2 border-red-500 text-red-200 flex items-center justify-between">
                  <span>
                    <span className="text-red-400 font-bold">for</span> sub <span className="text-red-400 font-bold">in</span> item.records: <span className="text-zinc-500"># O(N²) quadratic overhead</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 ml-2">
                    +14.2 gCO2e
                  </span>
                </div>
                <div className="pl-8 text-zinc-400">compute_metrics(sub)</div>
                <div className="mt-3 pt-2 border-t border-zinc-800/80 text-emerald-400 flex items-center gap-1.5">
                  <Check size={14} weight="bold" />
                  <span>Refactor recommendation: Vectorize with NumPy matrix (-82% CPU cycles)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Supported: Python, JS, TS, Go (Beta)</span>
              <span className="text-emerald-400">0.04s parse time per 1k LOC</span>
            </div>
          </div>

          {/* Cell 2: Automated GitHub PR Gate (1 col) */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                  <GitPullRequest size={16} weight="bold" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 font-semibold">
                  Layer 2: CI/CD Gate
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
                Automated GitHub PR Merge Gate
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                Evaluates runner execution duration, container layer caching, and redundant workflow runs on every pull request.
              </p>

              {/* Simulated PR Bot Comment */}
              <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 shadow-sm font-sans space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-zinc-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      C
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white font-mono">carbotrace[bot]</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    Warning
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Code Layer Delta:</span>
                    <span className="font-mono text-red-600 dark:text-red-400 font-semibold">+4.8 gCO2e</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>CI Runner Wattage:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">-1.2 Wh</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center justify-between">
                  <span>Threshold: 0.10</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">Merge Blocked</span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span>Drop-in GitHub Action workflow</span>
            </div>
          </div>

          {/* Cell 3: Regional Grid Telemetry (1 col) */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60">
                  <Globe size={16} weight="bold" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold">
                  Layer 3: Infra Grid
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
                Datacenter Grid Telemetry
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Correlates Terraform and CloudFormation templates with live regional electricity emissions and PUE factors.
              </p>

              {/* Grid Region Comparison Card */}
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white">eu-north-1</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Hydro / Wind Grid</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-bold">
                    32 g/kWh
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white">us-east-1</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Mixed Fossil Grid</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 font-bold">
                    384 g/kWh
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span>Covers AWS, GCP, Azure datacenters</span>
            </div>
          </div>

          {/* Cell 4: Local Ollama AI Remediation (1 col) */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-emerald-400 flex items-center justify-center border border-zinc-700/60">
                  <Cpu size={16} weight="bold" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-semibold">
                  Zero Data Leakage
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
                Local Ollama AI Patches
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Optimizes energy-draining routines locally using `qwen2.5-coder`. Your proprietary code never leaves your workstation or VPC.
              </p>

              <div className="p-3 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-xs space-y-1">
                <div className="text-zinc-500">$ ollama run qwen2.5-coder:1.5b</div>
                <div className="text-emerald-400">✓ 0 bytes sent to 3rd party APIs</div>
                <div className="text-zinc-400">✓ Air-gapped compliance verified</div>
              </div>
            </div>

            <div className="mt-5 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span>Optional local or containerized execution</span>
            </div>
          </div>

          {/* Cell 5: Package Carbon & Metadata Cache (1 col) */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
                  <Package size={16} weight="bold" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                  Dependency Intelligence
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
                Package Carbon Cache
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Indexes dependency weights and transitive package bloat across npm, PyPI, Maven, and RubyGems registries.
              </p>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-800 dark:text-zinc-200">express</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">58 KB / Light</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-800 dark:text-zinc-200">moment</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">4.2 MB / Heavy</span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span>Automated lighter alternative suggestions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
