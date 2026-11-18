'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import SmartCard3D from './SmartCard3D';
import ConsortiumGraph3D from './ConsortiumGraph3D';
import TamperLab3D from './TamperLab3D';
import Environment3D from './Environment3D';
import TelemetryHUD, { FiberViewMode } from './TelemetryHUD';

// Camera controller that smoothly glides camera between mode coordinates
function SmoothCameraController({ mode }: { mode: FiberViewMode }) {
  const targetPos = useRef(new THREE.Vector3(0, 0, 4.5));

  useEffect(() => {
    switch (mode) {
      case 'card':
        targetPos.current.set(0, 0, 4.5);
        break;
      case 'network':
        targetPos.current.set(0, 1.2, 7.8);
        break;
      case 'tamper':
        targetPos.current.set(0, 0.4, 5.2);
        break;
      case 'crypto':
        targetPos.current.set(2.8, 1.6, 5.2);
        break;
    }
  }, [mode]);

  useFrame((state, delta) => {
    state.camera.position.lerp(targetPos.current, Math.min(1, delta * 3.5));
  });

  return null;
}

export default function FiberCanvas() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<FiberViewMode>('card');

  // Smart Card 3D state
  const [isFlipped, setIsFlipped] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [wireframe, setWireframe] = useState(false);

  // Tamper Lab state
  const [isTampered, setIsTampered] = useState(false);

  // Active Network Node state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-[#07090e] flex flex-col items-center justify-center text-slate-400 font-mono gap-3">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm tracking-wider uppercase">Loading 3D Fiber Engine...</div>
        <div className="text-xs text-slate-600">Initializing WebGL 2.0 &amp; Three.js Canvas</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#04060d] overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. WEBGL THREE FIBER 3D CANVAS
          ───────────────────────────────────────────────────────────────────────────── */}
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 48 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030712']} />

        {/* Dynamic camera transitions */}
        <SmoothCameraController mode={mode} />

        {/* Cinematic 3D Lighting & Particles Environment */}
        <Environment3D
          glowColor={
            mode === 'tamper' && isTampered
              ? '#ef4444'
              : mode === 'crypto'
              ? '#818cf8'
              : '#06b6d4'
          }
        />

        {/* Orbit Controls (Smooth touch & mouse manipulation) */}
        <OrbitControls
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.05}
          maxDistance={14}
          minDistance={2.2}
          autoRotate={false}
          autoRotateSpeed={0.8}
        />

        {/* SCENE CONTENT BY MODE */}
        {mode === 'card' && (
          <group position={[0, 0, 0]}>
            <SmartCard3D
              isFlipped={isFlipped}
              onFlipToggle={() => setIsFlipped((prev) => !prev)}
              isScanning={isScanning}
              exploded={exploded}
              wireframe={wireframe}
              glowColor="#06b6d4"
            />
          </group>
        )}

        {mode === 'network' && (
          <group position={[0, 0, 0]}>
            <ConsortiumGraph3D
              onSelectNode={(id) => setSelectedNodeId(id)}
              activeNode={selectedNodeId}
              tamperState={isTampered}
            />
          </group>
        )}

        {mode === 'tamper' && (
          <group position={[0, 0, 0]}>
            <TamperLab3D
              isTampered={isTampered}
              onToggleTamper={() => setIsTampered((prev) => !prev)}
            />
          </group>
        )}

        {mode === 'crypto' && (
          <group position={[0, 0, 0]}>
            {/* Show both Card and Ethereum Block side by side */}
            <group position={[-1.5, 0, 0]}>
              <SmartCard3D
                isFlipped={true}
                onFlipToggle={() => setIsFlipped((prev) => !prev)}
                isScanning={false}
                exploded={false}
                wireframe={false}
                glowColor="#818cf8"
              />
            </group>
            <group position={[1.8, 0, 0]}>
              <mesh rotation={[0.4, 0.4, 0]}>
                <octahedronGeometry args={[1.1, 0]} />
                <meshStandardMaterial
                  color="#eab308"
                  metalness={0.9}
                  roughness={0.15}
                  emissive="#ca8a04"
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
          </group>
        )}
      </Canvas>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. INTERACTIVE TELEMETRY HUD & ACTION CONTROLS OVERLAY
          ───────────────────────────────────────────────────────────────────────────── */}
      <TelemetryHUD
        mode={mode}
        onModeChange={(m) => setMode(m)}
        isFlipped={isFlipped}
        onFlipToggle={() => setIsFlipped((prev) => !prev)}
        isScanning={isScanning}
        onScanToggle={() => setIsScanning((prev) => !prev)}
        exploded={exploded}
        onExplodeToggle={() => setExploded((prev) => !prev)}
        wireframe={wireframe}
        onWireframeToggle={() => setWireframe((prev) => !prev)}
        onResetCamera={handleResetCamera}
        isTampered={isTampered}
        onTamperToggle={() => setIsTampered((prev) => !prev)}
        selectedNodeId={selectedNodeId}
      />
    </div>
  );
}
