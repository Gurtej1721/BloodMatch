import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroMesh() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main Organic Blood Cell / Life Core
    const sphereGeo = new THREE.IcosahedronGeometry(1.4, 32);
    // Displace vertices slightly to create organic biconcave / fluid shape
    const posAttr = sphereGeo.attributes.position;
    const originalPositions = posAttr.array.slice();

    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0x581c87,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });

    const mainCell = new THREE.Mesh(sphereGeo, mainMaterial);
    scene.add(mainCell);

    // Inner glowing core
    const innerGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCore);

    // Ambient floating life particles (oxygen/platelet nodes)
    const particleCount = 140;
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = radius * Math.cos(phi);
      pScales[i] = Math.random() * 0.08 + 0.02;
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(pGeometry, pMaterial);
    scene.add(particleField);

    // Connecting Pulsing Rings
    const ringGeo = new THREE.TorusGeometry(2.1, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 3;
    scene.add(orbitalRing);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 2.5, 10);
    cyanPoint.position.set(4, 3, 3);
    scene.add(cyanPoint);

    const crimsonPoint = new THREE.PointLight(0xf43f5e, 3.0, 10);
    crimsonPoint.position.set(-4, -2, 2);
    scene.add(crimsonPoint);

    const violetPoint = new THREE.PointLight(0xa855f7, 2.0, 8);
    violetPoint.position.set(0, 4, -2);
    scene.add(violetPoint);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 500;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      // Fluid deformation of the core
      const positions = mainCell.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];

        // Complex biological wave distortion
        const wave = Math.sin(ox * 2.5 + t * 2.2) * Math.cos(oy * 2.5 + t * 1.8) * Math.sin(oz * 2.0 + t);
        const factor = 1 + wave * 0.08;

        positions[i] = ox * factor;
        positions[i + 1] = oy * factor;
        positions[i + 2] = oz * factor;
      }
      mainCell.geometry.attributes.position.needsUpdate = true;
      mainCell.geometry.computeVertexNormals();

      // Rotations
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      mainCell.rotation.y = t * 0.35 + mouseX;
      mainCell.rotation.x = Math.sin(t * 0.2) * 0.15 + mouseY;

      innerCore.rotation.y = -t * 0.5;
      innerCore.rotation.z = t * 0.2;

      particleField.rotation.y = t * 0.08;
      particleField.rotation.x = Math.sin(t * 0.1) * 0.05;

      orbitalRing.rotation.z = t * 0.15;
      orbitalRing.rotation.y = Math.sin(t * 0.2) * 0.2;

      // Pulse color glow
      const pulse = Math.sin(t * 3.0) * 0.2 + 0.8;
      crimsonPoint.intensity = 2.5 * pulse;
      cyanPoint.intensity = 2.0 + Math.cos(t * 2.5) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      mainMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pGeometry.dispose();
      pMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, []);

  return (
    <div className="w-full h-[400px] md:h-[540px] relative flex items-center justify-center">
      {/* Interactive 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Status Badges for high-tech biological feel */}
      <div className="absolute top-6 right-4 sm:right-10 glass-panel px-3.5 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-2 text-xs font-medium text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>Matching Engine Active</span>
      </div>

      <div className="absolute bottom-6 left-4 sm:left-10 glass-panel px-3.5 py-1.5 rounded-full border border-rose-500/30 flex items-center gap-2 text-xs font-medium text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>24/7 Rapid Response Network</span>
      </div>
    </div>
  );
}