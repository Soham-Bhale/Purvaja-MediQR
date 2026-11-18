'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from './SoundFX';

interface ConsortiumGraph3DProps {
  onSelectNode?: (nodeId: string) => void;
  activeNode?: string | null;
  tamperState?: boolean;
}

interface NodeData {
  id: string;
  name: string;
  role: string;
  sub: string;
  color: string;
  pos: [number, number, number];
  icon: string;
}

export default function ConsortiumGraph3D({
  onSelectNode,
  activeNode,
  tamperState = false,
}: ConsortiumGraph3DProps) {
  const nodes: NodeData[] = useMemo(
    () => [
      {
        id: 'paramedic',
        name: 'Roadside Paramedic',
        role: 'Air-Gap Optical Triage',
        sub: '< 0.02s · Zero Cloud Dependency',
        color: '#10b981',
        pos: [-3.8, 1.2, 0.5],
        icon: '🚑',
      },
      {
        id: 'esp32',
        name: 'ESP32 Sovereign Mesh',
        role: 'Hardware AP (192.168.4.1)',
        sub: 'WPA2-PSK · Air-Gapped RF Routing',
        color: '#06b6d4',
        pos: [-1.8, -1.0, 1.2],
        icon: '📡',
      },
      {
        id: 'hospitalA',
        name: 'Hospital Node A (Apollo)',
        role: 'Off-Chain Storage :5001',
        sub: 'AES-256-GCM Shards',
        color: tamperState ? '#ef4444' : '#38bdf8',
        pos: [1.8, 1.5, -0.5],
        icon: '🏥',
      },
      {
        id: 'hospitalB',
        name: 'Hospital Node B (Fortis)',
        role: 'Off-Chain Storage :5002',
        sub: 'Redundant Shard Replica',
        color: '#818cf8',
        pos: [3.8, -0.8, 0.2],
        icon: '🏥',
      },
      {
        id: 'blockchain',
        name: 'Ethereum Ledger',
        role: 'MedicalRecordLedger.sol',
        sub: 'Zero PII · 32-Byte SHA-256 Anchors',
        color: '#eab308',
        pos: [0.2, 2.5, -1.8],
        icon: '⛓️',
      },
      {
        id: 'doctor',
        name: 'Doctor Workstation',
        role: 'Verified Clinician Portal',
        sub: 'Live Hash Checksum Verification',
        color: '#a855f7',
        pos: [0.0, -1.8, -0.8],
        icon: '🩺',
      },
    ],
    [tamperState]
  );

  // Animated data flow pulses along bezier curves
  const pulsesRef = useRef<THREE.Group>(null);
  const pulseTimes = useRef([0, 0.25, 0.5, 0.75]);

  // Network connections (start Node -> end Node)
  const links: [string, string][] = useMemo(
    () => [
      ['paramedic', 'esp32'],
      ['esp32', 'doctor'],
      ['doctor', 'hospitalA'],
      ['doctor', 'hospitalB'],
      ['hospitalA', 'blockchain'],
      ['hospitalB', 'blockchain'],
    ],
    []
  );

  // Curves between nodes
  const curves = useMemo(() => {
    const nodeMap = new Map<string, [number, number, number]>();
    nodes.forEach((n) => nodeMap.set(n.id, n.pos));

    return links
      .map(([fromId, toId]) => {
        const p1 = nodeMap.get(fromId);
        const p2 = nodeMap.get(toId);
        if (!p1 || !p2) return null;

        const v1 = new THREE.Vector3(...p1);
        const v2 = new THREE.Vector3(...p2);
        const mid = new THREE.Vector3()
          .addVectors(v1, v2)
          .multiplyScalar(0.5)
          .add(new THREE.Vector3(0, 0.6, 0.2));

        return new THREE.QuadraticBezierCurve3(v1, mid, v2);
      })
      .filter((c): c is THREE.QuadraticBezierCurve3 => c !== null);
  }, [nodes, links]);

  useFrame((_, delta) => {
    // Advance pulse particles
    pulseTimes.current = pulseTimes.current.map((t) => (t + delta * 0.45) % 1);
  });

  return (
    <group>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. 3D NETWORK NODES
          ───────────────────────────────────────────────────────────────────────────── */}
      {nodes.map((node) => {
        const isSelected = activeNode === node.id;

        return (
          <Float key={node.id} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
            <group
              position={node.pos}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                if (onSelectNode) onSelectNode(node.id);
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              {/* Outer Pulsing Wireframe Sphere */}
              <mesh>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshBasicMaterial
                  color={node.color}
                  wireframe={true}
                  transparent={true}
                  opacity={isSelected ? 0.8 : 0.25}
                />
              </mesh>

              {/* Core Node Solid Shape */}
              <mesh>
                {node.id === 'blockchain' ? (
                  <octahedronGeometry args={[0.38, 0]} />
                ) : node.id.includes('hospital') ? (
                  <boxGeometry args={[0.42, 0.55, 0.42]} />
                ) : (
                  <sphereGeometry args={[0.32, 24, 24]} />
                )}
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={isSelected ? 0.6 : 0.25}
                  metalness={0.7}
                  roughness={0.2}
                />
              </mesh>

              {/* Glowing Halo Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.6, 0.7, 32]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent={true}
                  opacity={isSelected ? 0.7 : 0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* 3D Floating Typography Billboard */}
              <group position={[0, 0.75, 0]}>
                <Text
                  fontSize={0.2}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  font="/fonts/Geist-Bold.ttf"
                  outlineWidth={0.015}
                  outlineColor="#020617"
                >
                  {node.name}
                </Text>
                <Text
                  position={[0, -0.22, 0]}
                  fontSize={0.13}
                  color={node.color}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.01}
                  outlineColor="#020617"
                >
                  {node.role}
                </Text>
              </group>
            </group>
          </Float>
        );
      })}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. 3D CURVED NETWORK CONDUITS (BEZIER TUBES)
          ───────────────────────────────────────────────────────────────────────────── */}
      {curves.map((curve, idx) => {
        const points = curve.getPoints(30);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <group key={idx}>
            {/* Base static conduit line */}
            <primitive object={new THREE.Line(
              lineGeo,
              new THREE.LineBasicMaterial({
                color: tamperState && idx === 4 ? 0xef4444 : 0x06b6d4,
                transparent: true,
                opacity: 0.35,
                linewidth: 2,
              })
            )} />

            {/* Traveling Data Packet Photon */}
            {pulseTimes.current.map((t, pIdx) => {
              const pt = curve.getPoint((t + pIdx * 0.25) % 1);
              return (
                <mesh key={pIdx} position={[pt.x, pt.y, pt.z]}>
                  <sphereGeometry args={[0.06, 12, 12]} />
                  <meshBasicMaterial
                    color={tamperState && idx === 4 ? '#ef4444' : '#38bdf8'}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
