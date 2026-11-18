'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface TamperLab3DProps {
  isTampered: boolean;
  onToggleTamper: () => void;
}

export default function TamperLab3D({
  isTampered,
  onToggleTamper,
}: TamperLab3DProps) {
  const diskMeshRef = useRef<THREE.Mesh>(null);
  const chainMeshRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (diskMeshRef.current) {
      diskMeshRef.current.rotation.y += delta * 0.5;
      if (isTampered) {
        // Corrupted erratic jitter
        diskMeshRef.current.position.x = -1.6 + (Math.random() - 0.5) * 0.04;
        diskMeshRef.current.position.y = (Math.random() - 0.5) * 0.04;
      } else {
        diskMeshRef.current.position.x = -1.6;
        diskMeshRef.current.position.y = 0;
      }
    }

    if (chainMeshRef.current) {
      chainMeshRef.current.rotation.y -= delta * 0.3;
      chainMeshRef.current.rotation.x = Math.sin(timeRef.current * 0.8) * 0.15;
    }

    if (shieldRef.current && isTampered) {
      const s = 1.0 + Math.sin(timeRef.current * 8) * 0.08;
      shieldRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. LEFT OBJECT: OFF-CHAIN DISK RECORD (HOSPITAL NODE STORAGE)
          ───────────────────────────────────────────────────────────────────────────── */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[-1.6, 0, 0]}>
          <mesh ref={diskMeshRef}>
            <boxGeometry args={[1.2, 1.4, 0.4]} />
            <meshStandardMaterial
              color={isTampered ? '#ef4444' : '#0284c7'}
              roughness={0.2}
              metalness={0.8}
              wireframe={false}
              emissive={isTampered ? '#b91c1c' : '#0369a1'}
              emissiveIntensity={isTampered ? 0.7 : 0.2}
            />
          </mesh>

          {/* Wireframe cage */}
          <mesh>
            <boxGeometry args={[1.3, 1.5, 0.5]} />
            <meshBasicMaterial
              color={isTampered ? '#f87171' : '#38bdf8'}
              wireframe={true}
              transparent={true}
              opacity={0.35}
            />
          </mesh>

          {/* Label below disk record */}
          <group position={[0, -1.05, 0]}>
            <Text
              fontSize={0.16}
              color={isTampered ? '#fca5a5' : '#7dd3fc'}
              anchorX="center"
              anchorY="middle"
            >
              {isTampered ? '⚠️ BIT-FLIPPED OFF-CHAIN DISK' : '💾 ENCRYPTED DISK PAYLOAD'}
            </Text>
            <Text
              position={[0, -0.22, 0]}
              fontSize={0.11}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              {isTampered ? 'Corrupted SHA-256: 0x9e1a74d2...' : 'Clean SHA-256: 0x4f8c2b7e...'}
            </Text>
          </group>
        </group>
      </Float>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. RIGHT OBJECT: ON-CHAIN ETHEREUM ANCHOR (SOLIDITY SMART CONTRACT)
          ───────────────────────────────────────────────────────────────────────────── */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[1.6, 0, 0]}>
          <mesh ref={chainMeshRef}>
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial
              color="#eab308"
              metalness={0.9}
              roughness={0.15}
              emissive="#ca8a04"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Orbiting Ethereum Block Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.05, 1.15, 32]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent={true}
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Label below blockchain block */}
          <group position={[0, -1.05, 0]}>
            <Text
              fontSize={0.16}
              color="#fef08a"
              anchorX="center"
              anchorY="middle"
            >
              ⛓️ IMMUTABLE ON-CHAIN ANCHOR
            </Text>
            <Text
              position={[0, -0.22, 0]}
              fontSize={0.11}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              Contract: MedicalRecordLedger.sol
            </Text>
          </group>
        </group>
      </Float>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. CENTER COMPARISON BEAM & INTEGRITY BARRIER
          ───────────────────────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        {/* Horizontal Laser Inspection Beam */}
        <mesh ref={beamRef} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 16]} />
          <meshBasicMaterial
            color={isTampered ? '#ef4444' : '#10b981'}
            transparent={true}
            opacity={0.85}
          />
        </mesh>

        {/* Central Verification Indicator Node */}
        <mesh>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial
            color={isTampered ? '#ef4444' : '#10b981'}
            emissive={isTampered ? '#b91c1c' : '#059669'}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Warning Forcefield Shield (when Tampered) */}
        {isTampered && (
          <mesh ref={shieldRef}>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshBasicMaterial
              color="#ef4444"
              wireframe={true}
              transparent={true}
              opacity={0.6}
            />
          </mesh>
        )}

        {/* Center Floating Status Badge */}
        <group position={[0, 0.9, 0]}>
          <Text
            fontSize={0.2}
            color={isTampered ? '#ef4444' : '#10b981'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#020617"
          >
            {isTampered ? '❌ TAMPER DETECTED: HASH MISMATCH' : '✓ TAMPER-FREE: 100% VERIFIED'}
          </Text>
          <Text
            position={[0, -0.24, 0]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#020617"
          >
            {isTampered
              ? 'Mathematical Rejection (2⁻²⁵⁶) · Decryption Halted in Memory'
              : 'Computed SHA-256 matches Blockchain Anchor · Zero PII on-chain'}
          </Text>
        </group>
      </group>
    </group>
  );
}
