'use client';

import React, { useRef, useState } from 'react';

interface AppleVideoCardProps {
  src: string;
  poster?: string;
  title: string;
  subtitle?: string;
  badge: string;
  badgeColor?: 'rose' | 'emerald' | 'blue' | 'indigo' | 'purple' | 'amber';
  telemetryText?: string;
  className?: string;
}

export default function AppleVideoCard({
  src,
  poster,
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  telemetryText,
  className = '',
}: AppleVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const badgeColorMap = {
    rose: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      glow: 'from-rose-600/15 via-transparent to-transparent',
      dot: 'bg-rose-400',
    },
    emerald: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'from-emerald-600/15 via-transparent to-transparent',
      dot: 'bg-emerald-400',
    },
    blue: {
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      glow: 'from-blue-600/15 via-transparent to-transparent',
      dot: 'bg-blue-400',
    },
    indigo: {
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      glow: 'from-indigo-600/15 via-transparent to-transparent',
      dot: 'bg-indigo-400',
    },
    purple: {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'from-purple-600/15 via-transparent to-transparent',
      dot: 'bg-purple-400',
    },
    amber: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      glow: 'from-amber-600/15 via-transparent to-transparent',
      dot: 'bg-amber-400',
    },
  };

  const scheme = badgeColorMap[badgeColor] || badgeColorMap.blue;

  return (
    <div
      className={`relative group rounded-3xl overflow-hidden bg-slate-900/80 border ${scheme.border} backdrop-blur-xl shadow-2xl transition-all duration-500 ${className}`}
    >
      {/* Ambient Radial Backlight Glow */}
      <div
        className={`absolute -inset-1 bg-gradient-to-tr ${scheme.glow} opacity-40 blur-2xl group-hover:opacity-75 transition-opacity duration-700 pointer-events-none`}
      />

      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/80">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40 pointer-events-none" />

        {/* Top Header Floating Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border backdrop-blur-md ${scheme.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot} animate-ping`} />
              {badge}
            </span>
            {subtitle && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-300 bg-black/50 border border-white/10 backdrop-blur-md">
                {subtitle}
              </span>
            )}
          </div>

          {/* Interactive Player Controls (Play, Mute, Fullscreen) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center text-xs backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center text-xs backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="hidden sm:flex w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white items-center justify-center text-xs backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
            >
              ⛶
            </button>
          </div>
        </div>

        {/* Bottom Title & Telemetry Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10 pointer-events-none">
          <div className="space-y-1">
            <h4 className="text-base sm:text-xl font-bold text-white tracking-tight drop-shadow-md">
              {title}
            </h4>
            {telemetryText && (
              <p className="text-[11px] sm:text-xs font-mono text-slate-300 flex items-center gap-1.5 drop-shadow">
                <span className="text-emerald-400">●</span> {telemetryText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
