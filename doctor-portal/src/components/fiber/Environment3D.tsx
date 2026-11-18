'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Environment3DProps {
  glowColor?: string;
}

export default function Environment3D({ glowColor = '#06b6d4' }: Environment3DProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate 200 random 3D particle positions
  const [positions, colors] = useMemo(() => {
    const count = 220;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color('#06b6d4');
    const c2 = new THREE.Color('#10b981');
    const c3 = new THREE.Color('#38bdf8');
    const c4 = new THREE.Color('#eab308');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const choice = Math.random();
      const pickedColor = choice < 0.35 ? c1 : choice < 0.65 ? c2 : choice < 0.85 ? c3 : c4;
      col[i * 3] = pickedColor.r;
      col[i * 3 + 1] = pickedColor.g;
      col[i * 3 + 2] = pickedColor.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.03;
      particlesRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <group>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. LIGHTING RIG (Cinematic 3-Point Lighting + Cyber Rim)
          ───────────────────────────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.4} />

      {/* Main Key Light */}
      <directionalLight position={[6, 8, 5]} intensity={1.2} color="#ffffff" castShadow />

      {/* Cool Cyan Fill Light */}
      <pointLight position={[-8, 4, 3]} intensity={1.5} color="#06b6d4" distance={25} />

      {/* Emerald Cryptographic Rim Light */}
      <pointLight position={[8, -3, -4]} intensity={1.2} color="#10b981" distance={25} />

      {/* Purple/Blue Underlight */}
      <pointLight position={[0, -6, 2]} intensity={0.8} color="#6366f1" distance={18} />

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FLOATING CRYPTOGRAPHIC BIT PARTICLES
          ───────────────────────────────────────────────────────────────────────────── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors={true}
          transparent={true}
          opacity={0.65}
          sizeAttenuation={true}
        />
      </points>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. GROUND CYBERNETIC GRID
          ───────────────────────────────────────────────────────────────────────────── */}
      <gridHelper
        args={[30, 30, '#0284c7', '#0f172a']}
        position={[0, -2.4, 0]}
      />
    </group>
  );
}
