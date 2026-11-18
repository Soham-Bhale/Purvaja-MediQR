'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sound } from './SoundFX';

interface SmartCard3DProps {
  isFlipped: boolean;
  onFlipToggle?: () => void;
  isScanning: boolean;
  exploded: boolean;
  wireframe: boolean;
  glowColor?: string;
}

// Generate high-resolution procedural textures for Front & Back faces
function useCardTextures() {
  return useMemo(() => {
    // 1. FRONT FACE TEXTURE (Emergency Triage Matrix)
    const canvasFront = document.createElement('canvas');
    canvasFront.width = 1024;
    canvasFront.height = 648; // ~ ISO 7810 ratio (85.6 x 53.98)
    const ctxF = canvasFront.getContext('2d');

    if (ctxF) {
      // Dark Titanium Brushed Gradient Background
      const bgGrad = ctxF.createLinearGradient(0, 0, 1024, 648);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#050811');
      ctxF.fillStyle = bgGrad;
      ctxF.fillRect(0, 0, 1024, 648);

      // Fine brushed horizontal noise lines
      ctxF.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctxF.lineWidth = 1;
      for (let y = 0; y < 648; y += 4) {
        ctxF.beginPath();
        ctxF.moveTo(0, y);
        ctxF.lineTo(1024, y);
        ctxF.stroke();
      }

      // Outer Card Chamfer Border
      ctxF.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctxF.lineWidth = 5;
      ctxF.strokeRect(20, 20, 984, 608);

      // Top Header: Brand & Emergency Cross
      ctxF.fillStyle = '#06b6d4';
      ctxF.font = 'bold 36px "Geist", -apple-system, sans-serif';
      ctxF.fillText('PURVAJA MEDIQR', 50, 75);

      ctxF.fillStyle = '#94a3b8';
      ctxF.font = '500 18px "Geist Mono", monospace';
      ctxF.fillText('SOVEREIGN AIR-GAPPED EMERGENCY MATRIX', 50, 105);

      // Emergency Cross Emblem (Red & White)
      ctxF.fillStyle = '#ef4444';
      ctxF.beginPath();
      ctxF.roundRect(900, 45, 60, 60, 12);
      ctxF.fill();
      ctxF.fillStyle = '#ffffff';
      ctxF.fillRect(924, 55, 12, 40);
      ctxF.fillRect(910, 69, 40, 12);

      // Gold Chip Visual on Front-Left
      const chipGrad = ctxF.createLinearGradient(60, 170, 200, 290);
      chipGrad.addColorStop(0, '#eab308');
      chipGrad.addColorStop(0.5, '#fef08a');
      chipGrad.addColorStop(1, '#ca8a04');
      ctxF.fillStyle = chipGrad;
      ctxF.beginPath();
      ctxF.roundRect(60, 170, 130, 105, 12);
      ctxF.fill();
      ctxF.strokeStyle = '#854d0e';
      ctxF.lineWidth = 2.5;
      ctxF.stroke();

      // Chip contact lines
      ctxF.beginPath();
      ctxF.moveTo(60, 222); ctxF.lineTo(190, 222);
      ctxF.moveTo(125, 170); ctxF.lineTo(125, 275);
      ctxF.stroke();

      // Optical Dual-Segment QR Glyphs representation
      // Left QR Block (Plain Emergency Triage)
      const qrSize = 250;
      const qrX = 230;
      const qrY = 170;

      // QR Background Plate
      ctxF.fillStyle = '#ffffff';
      ctxF.beginPath();
      ctxF.roundRect(qrX, qrY, qrSize, qrSize, 14);
      ctxF.fill();

      // Simulated QR Finder Patterns
      const drawFinder = (x: number, y: number) => {
        ctxF.fillStyle = '#020617';
        ctxF.fillRect(x, y, 60, 60);
        ctxF.fillStyle = '#ffffff';
        ctxF.fillRect(x + 10, y + 10, 40, 40);
        ctxF.fillStyle = '#020617';
        ctxF.fillRect(x + 20, y + 20, 20, 20);
      };
      drawFinder(qrX + 16, qrY + 16);
      drawFinder(qrX + qrSize - 76, qrY + 16);
      drawFinder(qrX + 16, qrY + qrSize - 76);

      // Procedural QR Data Dots
      ctxF.fillStyle = '#020617';
      for (let r = 0; r < 14; r++) {
        for (let c = 0; c < 14; c++) {
          if ((r < 4 && c < 4) || (r < 4 && c > 9) || (r > 9 && c < 4)) continue;
          if ((r * 7 + c * 13) % 3 === 0 || (r + c) % 5 === 0) {
            ctxF.fillRect(qrX + 22 + c * 15, qrY + 22 + r * 15, 10, 10);
          }
        }
      }

      // Triage Data Cards on Right Side
      const infoX = 520;
      let infoY = 175;

      // 1. Blood Group Card
      ctxF.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctxF.strokeStyle = '#ef4444';
      ctxF.lineWidth = 2;
      ctxF.beginPath(); ctxF.roundRect(infoX, infoY, 440, 75, 10); ctxF.fill(); ctxF.stroke();

      ctxF.fillStyle = '#fca5a5';
      ctxF.font = 'bold 14px "Geist Mono", monospace';
      ctxF.fillText('CRITICAL BLOOD TYPE (UNIVERSAL DONOR)', infoX + 20, infoY + 28);
      ctxF.fillStyle = '#ffffff';
      ctxF.font = 'bold 32px "Geist", sans-serif';
      ctxF.fillText('O- NEGATIVE', infoX + 20, infoY + 63);

      // 2. Severe Allergy Card
      infoY += 92;
      ctxF.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctxF.strokeStyle = '#f59e0b';
      ctxF.beginPath(); ctxF.roundRect(infoX, infoY, 440, 75, 10); ctxF.fill(); ctxF.stroke();

      ctxF.fillStyle = '#fde68a';
      ctxF.font = 'bold 14px "Geist Mono", monospace';
      ctxF.fillText('ANAPHYLAXIS CONTRAINDICATION', infoX + 20, infoY + 28);
      ctxF.fillStyle = '#ffffff';
      ctxF.font = 'bold 26px "Geist", sans-serif';
      ctxF.fillText('PENICILLIN (SEVERE)', infoX + 20, infoY + 62);

      // 3. ICE Emergency Contact
      infoY += 92;
      ctxF.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctxF.strokeStyle = '#10b981';
      ctxF.beginPath(); ctxF.roundRect(infoX, infoY, 440, 75, 10); ctxF.fill(); ctxF.stroke();

      ctxF.fillStyle = '#a7f3d0';
      ctxF.font = 'bold 14px "Geist Mono", monospace';
      ctxF.fillText('IN CASE OF EMERGENCY (ICE CONTACT)', infoX + 20, infoY + 28);
      ctxF.fillStyle = '#ffffff';
      ctxF.font = 'bold 24px "Geist Mono", monospace';
      ctxF.fillText('+91 98201 23456 (SPOUSE)', infoX + 20, infoY + 62);

      // Bottom Status Footer
      ctxF.fillStyle = '#64748b';
      ctxF.font = '500 15px "Geist Mono", monospace';
      ctxF.fillText('AIR-GAP OPTICAL RETRIEVAL: < 0.02 SECONDS · ZERO INTERNET REQUIRED', 50, 590);

      ctxF.fillStyle = '#10b981';
      ctxF.font = 'bold 15px "Geist Mono", monospace';
      ctxF.fillText('● PARAMEDIC READY', 820, 590);
    }

    // 2. BACK FACE TEXTURE (Zero-Trust Cryptographic Vault & Blockchain Anchor)
    const canvasBack = document.createElement('canvas');
    canvasBack.width = 1024;
    canvasBack.height = 648;
    const ctxB = canvasBack.getContext('2d');

    if (ctxB) {
      // Dark Slate Cybernetic Gradient
      const bgGradB = ctxB.createLinearGradient(0, 0, 1024, 648);
      bgGradB.addColorStop(0, '#040711');
      bgGradB.addColorStop(0.5, '#0b1324');
      bgGradB.addColorStop(1, '#020617');
      ctxB.fillStyle = bgGradB;
      ctxB.fillRect(0, 0, 1024, 648);

      // Holographic security foil strip
      const holoGrad = ctxB.createLinearGradient(0, 80, 1024, 180);
      holoGrad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      holoGrad.addColorStop(0.25, 'rgba(168, 85, 247, 0.45)');
      holoGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
      holoGrad.addColorStop(0.75, 'rgba(16, 185, 129, 0.45)');
      holoGrad.addColorStop(1, 'rgba(6, 182, 212, 0.4)');
      ctxB.fillStyle = holoGrad;
      ctxB.fillRect(20, 60, 984, 90);

      // Foil text watermark
      ctxB.fillStyle = '#ffffff';
      ctxB.font = 'bold 22px "Geist Mono", monospace';
      ctxB.fillText('IMMUTABLE ETHEREUM LEDGER SEAL · ZERO PII ON-CHAIN · HIPAA & DPDP COMPLIANT', 60, 115);

      // Header on Back
      ctxB.fillStyle = '#38bdf8';
      ctxB.font = 'bold 30px "Geist", sans-serif';
      ctxB.fillText('ENCRYPTED CLINICAL VAULT KEY', 50, 205);

      ctxB.fillStyle = '#94a3b8';
      ctxF?.font && (ctxB.font = '500 16px "Geist Mono", monospace');
      ctxB.fillText('AUTHORIZED PRACTITIONER TERMINAL ACCESS ONLY', 50, 235);

      // Salted HMAC Query Hash Box
      ctxB.fillStyle = '#0f172a';
      ctxB.strokeStyle = '#38bdf8';
      ctxB.lineWidth = 2;
      ctxB.beginPath();
      ctxB.roundRect(50, 260, 620, 120, 12);
      ctxB.fill();
      ctxB.stroke();

      ctxB.fillStyle = '#38bdf8';
      ctxB.font = 'bold 15px "Geist Mono", monospace';
      ctxB.fillText('SALTED QUERY TOKEN: HMAC-SHA256(National_ID + Salt, K)', 70, 295);

      ctxB.fillStyle = '#f8fafc';
      ctxB.font = 'bold 17px "Geist Mono", monospace';
      ctxB.fillText('0x69c2fcaeb8ca20eefe591027426a4863', 70, 330);
      ctxB.fillText('b22f29312bb0e55597178eae3bc56872', 70, 355);

      // Encrypted Vault QR Code
      const qrBSize = 190;
      const qrBX = 740;
      const qrBY = 260;
      ctxB.fillStyle = '#ffffff';
      ctxB.beginPath();
      ctxB.roundRect(qrBX, qrBY, qrBSize, qrBSize, 12);
      ctxB.fill();

      // QR patterns on back
      ctxB.fillStyle = '#020617';
      const drawFinderB = (x: number, y: number) => {
        ctxB.fillRect(x, y, 45, 45);
        ctxB.fillStyle = '#ffffff';
        ctxB.fillRect(x + 8, y + 8, 29, 29);
        ctxB.fillStyle = '#020617';
        ctxB.fillRect(x + 15, y + 15, 15, 15);
      };
      drawFinderB(qrBX + 12, qrBY + 12);
      drawFinderB(qrBX + qrBSize - 57, qrBY + 12);
      drawFinderB(qrBX + 12, qrBY + qrBSize - 57);

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if ((r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3)) continue;
          if ((r * 11 + c * 17) % 3 === 0) {
            ctxB.fillRect(qrBX + 18 + c * 15, qrBY + 18 + r * 15, 10, 10);
          }
        }
      }

      // Cryptographic Specifications Panel
      ctxB.fillStyle = '#1e293b';
      ctxB.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctxB.beginPath();
      ctxB.roundRect(50, 410, 910, 130, 12);
      ctxB.fill();
      ctxB.stroke();

      ctxB.fillStyle = '#94a3b8';
      ctxB.font = '500 15px "Geist Mono", monospace';
      ctxB.fillText('OFF-CHAIN STORAGE: Multi-Hospital Shards (Apollo :5001 & Fortis :5002)', 75, 445);
      ctxB.fillText('ON-CHAIN ANCHOR: bytes32 fileHash SHA-256 Checksum on EVM Contract', 75, 475);
      ctxB.fillText('INTEGRITY ENGINE: Bit-Flip Clashes Rejected Live in < 1ms at Clinician Station', 75, 505);

      // Warning Legal Footer
      ctxB.fillStyle = '#ef4444';
      ctxB.font = 'bold 14px "Geist Mono", monospace';
      ctxB.fillText('WARNING: UNAUTHORIZED ATTEMPTS TO ALTER OFF-CHAIN FILES TRIGGER INSTANT SMART CONTRACT AUDIT ALARM', 50, 595);
    }

    const texFront = new THREE.CanvasTexture(canvasFront);
    texFront.generateMipmaps = true;
    texFront.minFilter = THREE.LinearMipmapLinearFilter;

    const texBack = new THREE.CanvasTexture(canvasBack);
    texBack.generateMipmaps = true;
    texBack.minFilter = THREE.LinearMipmapLinearFilter;

    return { texFront, texBack };
  }, []);
}

export default function SmartCard3D({
  isFlipped,
  onFlipToggle,
  isScanning,
  exploded,
  wireframe,
  glowColor = '#06b6d4',
}: SmartCard3DProps) {
  const { texFront, texBack } = useCardTextures();
  const groupRef = useRef<THREE.Group>(null);
  const cardBodyRef = useRef<THREE.Group>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);

  // Card dimensions (ISO 7810 standard scaled: 3.4 x 2.15 x 0.04)
  const cardW = 3.4;
  const cardH = 2.15;
  const cardD = 0.04;

  // Target rotation for smooth flip
  const targetRotY = isFlipped ? Math.PI : 0;
  const currentRotY = useRef(0);
  const floatTime = useRef(0);
  const scanPos = useRef(0);

  // Mouse tilt tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    floatTime.current += delta;

    // Smooth rotational dampening towards target rotation
    currentRotY.current = THREE.MathUtils.damp(currentRotY.current, targetRotY, 8, delta);

    if (groupRef.current) {
      // Gentle floating animation
      const hoverY = Math.sin(floatTime.current * 1.8) * 0.06;
      groupRef.current.position.y = hoverY;

      // Parallax mouse tilt (subtle)
      const targetTiltX = mousePos.y * 0.15;
      const targetTiltZ = -mousePos.x * 0.1;
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetTiltX, 4, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetTiltZ, 4, delta);
      groupRef.current.rotation.y = currentRotY.current;
    }

    // Laser Scan Beam animation
    if (scanBeamRef.current) {
      if (isScanning) {
        scanBeamRef.current.visible = true;
        scanPos.current = (Math.sin(floatTime.current * 4) * 0.5 + 0.5) * (cardH - 0.2) - (cardH / 2 - 0.1);
        scanBeamRef.current.position.y = scanPos.current;
      } else {
        scanBeamRef.current.visible = false;
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    sound.playFlip();
    if (onFlipToggle) onFlipToggle();
  };

  // Exploded layer offsets
  const layerOffset = exploded ? 0.35 : 0;

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* ─────────────────────────────────────────────────────────────────────────────
          MAIN CARD BODY (Explodable into 4 micro-layers)
          ───────────────────────────────────────────────────────────────────────────── */}
      <group ref={cardBodyRef}>

        {/* LAYER 1: Front Protective Ceramic & AR Lens Faceplate */}
        <mesh position={[0, 0, cardD / 2 + (exploded ? layerOffset * 1.8 : 0)]}>
          <planeGeometry args={[cardW, cardH]} />
          <meshPhysicalMaterial
            map={texFront}
            roughness={0.25}
            metalness={0.65}
            wireframe={wireframe}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* LAYER 2: Hardware Core (Titanium Slab & Chamfer Edge) */}
        <mesh position={[0, 0, exploded ? layerOffset * 0.6 : 0]}>
          <boxGeometry args={[cardW, cardH, cardD]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.2}
            metalness={0.85}
            wireframe={wireframe}
          />
        </mesh>

        {/* LAYER 3: Internal Embedded RFID/NFC Micro-Antenna Coil (Visible when Exploded) */}
        {exploded && (
          <group position={[0, 0, -layerOffset * 0.6]}>
            <mesh>
              <planeGeometry args={[cardW * 0.9, cardH * 0.88]} />
              <meshBasicMaterial
                color="#06b6d4"
                wireframe={true}
                transparent={true}
                opacity={0.4}
              />
            </mesh>
            <mesh position={[-0.8, 0, 0.01]}>
              <boxGeometry args={[0.3, 0.3, 0.02]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        )}

        {/* LAYER 4: Back Zero-Trust Cryptographic Vault Faceplate */}
        <mesh
          position={[0, 0, -cardD / 2 - (exploded ? layerOffset * 1.8 : 0)]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[cardW, cardH]} />
          <meshPhysicalMaterial
            map={texBack}
            roughness={0.25}
            metalness={0.65}
            wireframe={wireframe}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* LASER SCAN BEAM PLANE */}
        <mesh ref={scanBeamRef} position={[0, 0, cardD / 2 + 0.02]}>
          <planeGeometry args={[cardW * 1.05, 0.06]} />
          <meshBasicMaterial
            color="#10b981"
            transparent={true}
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Subtle Edge Glow Halo */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[cardW + 0.04, cardH + 0.04, cardD + 0.01]} />
          <meshBasicMaterial
            color={glowColor}
            wireframe={true}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}
