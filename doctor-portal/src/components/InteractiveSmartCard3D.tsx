'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Float, ContactShadows } from '@react-three/drei';

interface CardModelProps {
  isAutoRotate: boolean;
  targetRotationY: number | null;
  onClearTargetRotation: () => void;
  onFaceDetected?: (face: 'FRONT' | 'BACK') => void;
}

function CardModel({ isAutoRotate, targetRotationY, onClearTargetRotation, onFaceDetected }: CardModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load textures
  const frontTexture = useTexture('/cards/front-side-card.png');
  const backTexture = useTexture('/cards/back-side-card.png');

  useEffect(() => {
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.anisotropy = 16;
    backTexture.anisotropy = 16;
  }, [frontTexture, backTexture]);

  // Card dimensions (ISO 7810 ratio ~1.78:1 based on generated 600x337 PNGs)
  const cardWidth = 3.56;
  const cardHeight = 2.0;
  const cardDepth = 0.04;

  // Material array: [+X, -X, +Y, -Y, +Z (Front), -Z (Back)]
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1e293b'),
    metalness: 0.85,
    roughness: 0.3,
  });

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: frontTexture,
    metalness: 0.4,
    roughness: 0.35,
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    map: backTexture,
    metalness: 0.5,
    roughness: 0.3,
  });

  const materials = [
    edgeMaterial, // +X
    edgeMaterial, // -X
    edgeMaterial, // +Y
    edgeMaterial, // -Y
    frontMaterial, // +Z (Side A Front)
    backMaterial,  // -Z (Side B Back)
  ];

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly animate towards target rotation if requested (Flip to Front or Back)
    if (targetRotationY !== null) {
      const current = meshRef.current.rotation.y;
      const diff = targetRotationY - current;
      if (Math.abs(diff) > 0.01) {
        meshRef.current.rotation.y += diff * Math.min(delta * 6, 0.2);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 4);
      } else {
        meshRef.current.rotation.y = targetRotationY;
        onClearTargetRotation();
      }
    } else if (isAutoRotate) {
      meshRef.current.rotation.y += delta * 0.75;
    }

    // Detect which face is pointing towards the camera
    const rotY = (meshRef.current.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const isFront = rotY < Math.PI * 0.5 || rotY > Math.PI * 1.5;
    if (onFaceDetected) {
      onFaceDetected(isFront ? 'FRONT' : 'BACK');
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.3}
      floatingRange={[-0.05, 0.05]}
    >
      <mesh
        ref={meshRef}
        material={materials}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[cardWidth, cardHeight, cardDepth]} />
      </mesh>
    </Float>
  );
}

export default function InteractiveSmartCard3D() {
  const [mounted, setMounted] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [targetRotationY, setTargetRotationY] = useState<number | null>(null);
  const [activeFace, setActiveFace] = useState<'FRONT' | 'BACK'>('FRONT');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/15 bg-slate-950 flex items-center justify-center font-mono text-xs text-slate-400">
        Loading 3D WebGL Canvas...
      </div>
    );
  }

  const flipToFront = () => {
    setIsAutoRotate(false);
    setTargetRotationY(0);
  };

  const flipToBack = () => {
    setIsAutoRotate(false);
    setTargetRotationY(Math.PI);
  };

  const toggleAutoRotate = () => {
    setTargetRotationY(null);
    setIsAutoRotate((prev) => !prev);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-slate-950 via-[#06080e] to-black shadow-2xl transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'aspect-video w-full'
    }`}>
      {/* 3D WebGL Canvas */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.2} />
          
          {/* Key lights for specular titanium reflections */}
          <directionalLight position={[4, 5, 4]} intensity={2.0} castShadow />
          <directionalLight position={[-4, 3, -4]} intensity={1.0} color="#06b6d4" />
          <pointLight position={[0, -2, 3]} intensity={0.8} color="#38bdf8" />
          <pointLight position={[0, 3, -3]} intensity={0.8} color="#818cf8" />

          <Suspense fallback={null}>
            <CardModel
              isAutoRotate={isAutoRotate}
              targetRotationY={targetRotationY}
              onClearTargetRotation={() => setTargetRotationY(null)}
              onFaceDetected={setActiveFace}
            />
            <ContactShadows
              position={[0, -1.3, 0]}
              opacity={0.65}
              scale={6}
              blur={2.2}
              far={3.5}
            />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={6.0}
            rotateSpeed={0.8}
            dampingFactor={0.08}
            enableDamping
          />
        </Canvas>
      </div>

      {/* Top Left Live Face Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-lg transition-all ${
          activeFace === 'FRONT'
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
            : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50'
        }`}>
          <span>{activeFace === 'FRONT' ? 'SIDE A • FRONT (ROADSIDE TRIAGE)' : 'SIDE B • REVERSE (PHYSICIAN KEY)'}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline bg-black/40 px-2 py-0.5 rounded border border-white/10">
          Drag to Orbit 360°
        </span>
      </div>

      {/* Top Right Fullscreen & Auto-Rotate Toggle */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAutoRotate}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
            isAutoRotate
              ? 'bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border-cyan-500/50'
              : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/15'
          }`}
          title="Toggle 360° Continuous Turntable"
        >
          <span>{isAutoRotate ? '⏸ Pause Orbit' : '▶ 360° Auto-Rotate'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 flex items-center justify-center text-xs font-bold transition cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>

      {/* Bottom Interactive Control HUD */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Quick Flip Presets */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={flipToFront}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
              activeFace === 'FRONT' && !isAutoRotate
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                : 'bg-black/60 hover:bg-white/10 text-slate-300 border-white/15 backdrop-blur-md'
            }`}
          >
            <span>📱 Flip to Front (Side A)</span>
          </button>

          <button
            type="button"
            onClick={flipToBack}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
              activeFace === 'BACK' && !isAutoRotate
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-black/60 hover:bg-white/10 text-slate-300 border-white/15 backdrop-blur-md'
            }`}
          >
            <span>⛓️ Flip to Back (Side B)</span>
          </button>
        </div>

        {/* Feature Highlights on Active Face */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
          {activeFace === 'FRONT' ? (
            <>
              <span className="text-cyan-400 font-bold">✓ 0.018s Roadside Scan</span>
              <span>•</span>
              <span className="text-rose-400">Emergency Blood &amp; Allergies</span>
              <span>•</span>
              <span className="text-emerald-400">Zero Cloud/App Required</span>
            </>
          ) : (
            <>
              <span className="text-indigo-400 font-bold">✓ 32-Byte Physician HMAC</span>
              <span>•</span>
              <span className="text-amber-400">Consortium Ethereum Proof</span>
              <span>•</span>
              <span className="text-emerald-400">FIDO2 Contact Chip</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
