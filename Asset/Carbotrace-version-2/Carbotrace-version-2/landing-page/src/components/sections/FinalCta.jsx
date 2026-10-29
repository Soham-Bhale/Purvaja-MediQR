import { Sparkle, ArrowRight, GithubLogo } from '@phosphor-icons/react';

export function FinalCta() {
  return (
    <section className="py-20 md:py-28 bg-[#fafafa] dark:bg-[#09090b] transition-colors" aria-label="Call to action">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CleanShot-style Radiant Deep Dark Aurora Card */}
        <div className="relative rounded-3xl aurora-mesh border border-zinc-800 p-8 sm:p-14 lg:p-20 text-center overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            {/* Glowing Brand Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700/80 text-emerald-400 shadow-lg shadow-emerald-950/40 mx-auto">
              <Sparkle size={28} weight="fill" />
            </div>

            {/* Headline (Max 2 lines) */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Start tracking your software <br />
              carbon footprint today.
            </h2>

            {/* Subtext (Max 20 words) */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Open source, zero-config, and ready to integrate directly with your GitHub pull request workflows.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#hero-scan"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold tracking-wide transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>Scan a Repository Now</span>
                <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
              </a>

              <a
                href="https://github.com/DChitale/Carbotrace"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-sm font-semibold transition-all border border-zinc-700/80 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <GithubLogo size={18} weight="bold" />
                <span>Star on GitHub</span>
              </a>
            </div>

            {/* Micro guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-400">
              <span>MIT Licensed</span>
              <span>-</span>
              <span>Self-Hostable</span>
              <span>-</span>
              <span>Air-Gapped Ollama AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
