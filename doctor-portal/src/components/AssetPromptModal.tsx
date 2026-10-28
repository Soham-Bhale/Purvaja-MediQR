'use client';

import React, { useState } from 'react';

interface AssetPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetPromptModal({ isOpen, onClose }: AssetPromptModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const videoPrompts = [
    {
      id: 'hero-vid',
      title: '1. Hero Background Video (Cinematic Healthtech & Blockchain)',
      targetFile: 'doctor-portal/public/videos/hero.mp4',
      tool: 'Runway Gen-3 Alpha / Luma Dream Machine / Kling AI',
      prompt: `Cinematic 4K slow camera track through a futuristic dark laboratory. In the center, a glowing holographic human biometric silhouette and rotating DNA helix seamlessly morph into glowing 3D cryptographic blockchain cubes with hex hashes (0x69c2...). Floating medical data particles, soft volumetric cyan and deep indigo lighting, high-tech bokeh, sleek Apple-style tech aesthetic, photorealistic, 60fps, no text.`,
    },
    {
      id: 'problem-vid',
      title: '2. The Crisis / Problem Video (Roadside ER & Unconscious Patient)',
      targetFile: 'doctor-portal/public/videos/problem.mp4',
      tool: 'Runway Gen-3 / OpenAI Sora / Luma Dream Machine',
      prompt: `Dramatic cinematic night scene. Heavy rain, flashing ambulance emergency red and blue siren lights reflecting on wet asphalt. Paramedics in high-visibility uniforms urgently examining an unconscious patient on a stretcher. A paramedic looks stressed holding an empty wallet with no ID. Close-up on heart rate monitor showing critical arrhythmia. Cinematic film grain, moody dark blue and amber contrast, dramatic tension, photorealistic 8k, slow motion.`,
    },
    {
      id: 'solution-vid',
      title: '3. The MediQR Solution Video (0.02s Optical Paramedic Scan)',
      targetFile: 'doctor-portal/public/videos/solution.mp4',
      tool: 'Runway Gen-3 / Luma Dream Machine / Sora',
      prompt: `First-person POV of an emergency responder holding a rugged smartphone. The camera aims at a sleek smart emergency medical wristband with a glowing laser-etched QR code. In an instant (0.02 seconds), a vivid holographic augmented reality HUD snaps into focus above the wristband displaying: bright bold red "BLOOD: O- NEGATIVE", pulsing yellow warning "ALLERGY: PENICILLIN G", and green verified blockchain seal. Paramedic smiles with relief. Clean cyberpunk hospital aesthetics, crisp photorealism.`,
    },
    {
      id: 'blockchain-vid',
      title: '4. Blockchain Immutability & Hash Chaining Video',
      targetFile: 'doctor-portal/public/videos/blockchain.mp4',
      tool: 'Runway Gen-3 Alpha / Midjourney Motion / Pika',
      prompt: `Macro cinematic visual of glowing crystalline digital blocks forming on a dark glass plane. A beam of laser light computes a 32-byte SHA-256 hash connecting Block #1 to Block #2 with an unbreakable glowing neon chain. When a red simulated corrupted bit attempts to modify the block, a digital security shield flashes and instantly rejects it, preserving the pristine green chain. Elegant, high-tech academic visual, 4k 60fps.`,
    },
  ];

  const imagePrompts = [
    {
      id: 'card-mockup',
      title: '5. Physical MediQR Smart Card (Dual-Segment Layout)',
      targetFile: 'doctor-portal/public/images/mediqr-card.png',
      tool: 'Midjourney v6 / DALL-E 3',
      prompt: `Commercial product photography of a premium matte black titanium smart medical emergency card resting on clean slate desk. On the front: laser-engraved emergency triage details with high-contrast red emergency cross, bold blood group "O-", allergy warning strip, and high-precision micro QR code. Soft Apple studio lighting, extreme sharp focus, depth of field, 8k resolution, minimalist luxury aesthetic --ar 16:9 --style raw --v 6.0`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-md">
              🎬
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Cinematic AI Media Generation Prompts
              </h2>
              <p className="text-xs text-slate-400">
                Ready-to-use production prompts for Runway Gen-3, Luma Dream Machine, Sora &amp; Midjourney
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-200 space-y-1">
            <strong className="text-white block text-sm">💡 How to use these videos:</strong>
            <p>1. Copy any prompt below into <strong>Runway Gen-3</strong> (runwayml.com), <strong>Luma Dream Machine</strong> (lumalabs.ai), or <strong>Kling AI</strong>.</p>
            <p>2. Download the generated MP4 video.</p>
            <p>3. Drop it directly into the indicated folder (e.g. <code className="font-mono text-indigo-300">doctor-portal/public/videos/hero.mp4</code>).</p>
            <p>4. The website will automatically detect and play your video in high definition with zero code changes!</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
              Video Generation Prompts (AI Video Engines)
            </h3>

            {videoPrompts.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <span className="text-[11px] text-slate-400">Recommended for: <strong className="text-purple-400">{item.tool}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(item.prompt, item.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    {copiedId === item.id ? '✓ Copied Prompt!' : '📋 Copy Prompt'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed select-all">
                  {item.prompt}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  📁 Save file as: <span className="text-emerald-400">{item.targetFile}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
              Photorealistic Image Prompts (Midjourney v6 / DALL-E)
            </h3>

            {imagePrompts.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <span className="text-[11px] text-slate-400">Recommended for: <strong className="text-purple-400">{item.tool}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(item.prompt, item.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    {copiedId === item.id ? '✓ Copied Prompt!' : '📋 Copy Prompt'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed select-all">
                  {item.prompt}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  📁 Save file as: <span className="text-emerald-400">{item.targetFile}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Prompts
          </button>
        </div>
      </div>
    </div>
  );
}
