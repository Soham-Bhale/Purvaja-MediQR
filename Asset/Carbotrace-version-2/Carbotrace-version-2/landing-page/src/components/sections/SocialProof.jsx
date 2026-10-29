export function SocialProof() {
  return (
    <section className="py-12 border-y border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors" aria-label="Ecosystem and integrations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-8 font-medium">
          Engineered for modern software stacks and cloud environments
        </p>

        {/* Clean monochrome SVG logo wall strictly adhering to the LOGO-ONLY rule */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16 text-zinc-600 dark:text-zinc-400">
          {/* GitHub */}
          <div className="flex items-center gap-2 hover:text-zinc-950 dark:hover:text-white transition-colors" title="GitHub Actions">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">GitHub</span>
          </div>

          {/* Vercel */}
          <div className="flex items-center gap-2 hover:text-zinc-950 dark:hover:text-white transition-colors" title="Vercel">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M24 22.525H0l12-21.05 12 21.05z" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">Vercel</span>
          </div>

          {/* Amazon Web Services */}
          <div className="flex items-center gap-2 hover:text-zinc-950 dark:hover:text-white transition-colors" title="Amazon Web Services">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M18.75 14.28c-.14-.14-.37-.14-.52 0-.97.94-2.52 1.63-4.47 1.63-2.73 0-4.83-1.42-4.83-4.14 0-2.88 2.37-4.13 5.48-4.13.88 0 1.69.1 2.34.29.18.06.37-.06.37-.25V6.7c0-2.32-1.57-3.41-4.12-3.41-1.74 0-3.37.56-4.52 1.54-.15.13-.15.36-.01.5l.89.92c.13.14.35.15.49.03.85-.71 2.06-1.12 3.2-1.12 1.52 0 2.35.6 2.35 1.83v.55c-4.46.25-7.79 1.77-7.79 5.34 0 2.84 2.11 4.5 4.88 4.5 2.15 0 3.73-.85 4.7-2.12v1.27c0 .19.16.35.35.35h1.23c.19 0 .35-.16.35-.35v-6.28c0-.06-.05-.1-.1-.1h-1.3c-.06 0-.1.05-.1.1v4.44l.44.02zm-3.39.06c-1.43 0-2.9-.6-2.9-2.61 0-1.84 1.4-2.48 3.8-2.63v2.85c-.32 1.44-.9 2.39-.9 2.39zM12 22.5c5.2 0 9.8-2.65 11.75-3.87.21-.13.14-.4-.1-.4-.82.02-3.05.2-6.52-.77-.1-.03-.21.02-.27.11-.92 1.4-2.74 2.93-4.86 2.93-3.64 0-6.85-2.7-8.17-5.93-.05-.12-.19-.17-.31-.11l-.85.4c-.13.06-.18.21-.12.33C4.24 19.33 7.84 22.5 12 22.5z" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">AWS</span>
          </div>

          {/* Docker */}
          <div className="flex items-center gap-2 hover:text-zinc-950 dark:hover:text-white transition-colors" title="Docker">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm-2.955 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H8.074a.185.185 0 00-.185.185v1.888c0 .102.083.186.185.186zm-2.955 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.12a.186.186 0 00-.186.185v1.888c0 .102.084.186.186.186zm5.91 2.714h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.186.186 0 00-.186.185v1.888c0 .102.083.185.186.185zm-2.955 0h2.119a.186.186 0 00.185-.185V9.006a.185.185 0 00-.185-.186H8.074a.186.186 0 00-.185.185v1.888c0 .102.083.185.185.185zm-2.955 0h2.119a.186.186 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.12a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185zm-2.955 0h2.119a.186.186 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.164a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m21.808 1.458c-.365-.25-1.127-.47-2.072-.257-.18.04-.37.098-.55.17a3.844 3.844 0 00-.776-.55c-.987-.514-2.167-.406-3.03.183-.347-.22-.743-.37-1.185-.436H.887a.887.887 0 00-.887.887c0 2.502.97 4.774 2.593 6.452 2.054 2.124 5.035 3.328 8.442 3.328 6.55 0 11.96-4.57 12.87-10.742a2.036 2.036 0 00-.07-.935l-.015-.11z" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">Docker</span>
          </div>

          {/* Cloudflare */}
          <div className="flex items-center gap-2 hover:text-zinc-950 dark:hover:text-white transition-colors" title="Cloudflare">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M18.423 11.082a5.952 5.952 0 00-4.839-4.78 6.015 6.015 0 00-6.108 3.51A4.75 4.75 0 004.75 14.5c0 .17.01.34.03.5H3.5a3.5 3.5 0 000 7h15.25a4.25 4.25 0 00.32-8.487l-.647-.43z" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">Cloudflare</span>
          </div>

          {/* Python */}
          <div className="flex items-center gap-2 hover:text-zinc-950 dark:hover:text-white transition-colors" title="Python">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M11.914 0C5.825 0 6.2 2.645 6.2 2.645l.006 2.74h5.82v.823H3.852S0 5.766 0 11.905c0 6.14 3.36 5.92 3.36 5.92h2.004v-2.822s-.11-3.36 3.303-3.36h5.688s3.19.053 3.19-3.085V3.085S18.01 0 11.914 0zm-3.2 1.832a1.004 1.004 0 110 2.008 1.004 1.004 0 010-2.008zM12.086 24c6.089 0 5.714-2.645 5.714-2.645l-.006-2.74h-5.82v-.823h8.174S24 18.234 24 12.095c0-6.14-3.36-5.92-3.36-5.92h-2.004v2.822s.11 3.36-3.303 3.36H9.645s-3.19-.053-3.19 3.085v5.474S5.99 24 12.086 24zm3.2-1.832a1.004 1.004 0 110-2.008 1.004 1.004 0 010 2.008z" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">Python</span>
          </div>
        </div>
      </div>
    </section>
  );
}
