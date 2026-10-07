import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Droplet } from 'lucide-react';

export default function ScrollyCanvas({ scrollProgress = 0 }) {
  const containerRef = useRef(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const triggerPulseRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = window.innerWidth || container.clientWidth || 800;
    const height = window.innerHeight || container.clientHeight || 800;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group containers
    const dropletGroup = new THREE.Group();
    scene.add(dropletGroup);

    // Baby & Recovery Bed Group (anchored at the bottom of the viewport)
    const patientGroup = new THREE.Group();
    const PATIENT_BASE_Y = -1.3;
    patientGroup.position.set(0, PATIENT_BASE_Y, 0);
    scene.add(patientGroup);

    // 1. Procedural 3D Blood Droplet / Orb Geometry
    const dropPoints = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const y = (1 - t) * 2.0 - 0.7; // Height range
      const r = Math.sin(Math.PI * t) * (1 - 0.5 * t) * 0.75; // Tapered teardrop radius
      dropPoints.push(new THREE.Vector2(Math.max(0.001, r), y));
    }
    const dropGeometry = new THREE.LatheGeometry(dropPoints, 40);
    const dropPositions = dropGeometry.attributes.position.array.slice();

    const dropMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0x881337,
      emissiveIntensity: 0.65,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.55,
      ior: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const dropMesh = new THREE.Mesh(dropGeometry, dropMaterial);
    dropMesh.scale.set(0.7, 0.7, 0.7);
    dropletGroup.add(dropMesh);

    // Glowing wireframe inner core of the orb
    const coreGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff6b81,
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    dropletGroup.add(innerCore);

    // Leaf-like glowing aura contour framing the orb
    const leafPoints = [];
    for (let i = 0; i <= 36; i++) {
      const theta = (i / 36) * Math.PI * 2;
      const r = 0.95 * (1 + 0.35 * Math.sin(2 * theta));
      leafPoints.push(new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta) * 1.35, 0));
    }
    const leafGeo = new THREE.BufferGeometry().setFromPoints(leafPoints);
    const leafMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const leafAura = new THREE.Line(leafGeo, leafMat);
    dropletGroup.add(leafAura);

    // Orthogonal leaf aura loop for depth
    const leafAura2 = new THREE.Line(leafGeo, leafMat.clone());
    leafAura2.rotation.y = Math.PI / 2.5;
    dropletGroup.add(leafAura2);

    // 2. Trailing Luminescence Particle Stream
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 0.45;
      pPositions[i * 3 + 1] = Math.random() * 2.2;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleTrail = new THREE.Points(pGeo, pMat);
    dropletGroup.add(particleTrail);

    // 3. Stylized Resting Baby Silhouette (The dark blue shape at the bottom)
    // Baby recovery bed
    const bedGeo = new THREE.BoxGeometry(2.4, 0.25, 1.2);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate/navy
      roughness: 0.8,
    });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = -0.4;
    patientGroup.add(bed);

    // Bed frame legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    [[-1.0, 0.45], [1.0, 0.45], [-1.0, -0.45], [1.0, -0.45]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, -0.65, lz);
      patientGroup.add(leg);
    });

    // Dark blue baby body silhouette material
    const patientMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark blue shape at the bottom
      emissive: 0x0a1122,
      roughness: 0.6,
      metalness: 0.2,
    });

    // Pillow
    const pillowGeo = new THREE.BoxGeometry(0.5, 0.12, 0.6);
    const pillow = new THREE.Mesh(pillowGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    pillow.position.set(-0.7, -0.2, 0);
    patientGroup.add(pillow);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, patientMat);
    head.position.set(-0.7, -0.05, 0);
    patientGroup.add(head);

    // Torso / Blanket draped over baby (THE DARK BLUE BODY SHAPE AT THE BOTTOM)
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.3, 12);
    bodyGeo.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, patientMat);
    const BABY_LOCAL_X = 0.1;
    const BABY_LOCAL_Y = -0.15;
    body.position.set(BABY_LOCAL_X, BABY_LOCAL_Y, 0);
    patientGroup.add(body);

    // Exact world coordinates of the baby's body:
    const BABY_BODY_WORLD_X = BABY_LOCAL_X;
    const BABY_BODY_WORLD_Y = PATIENT_BASE_Y + BABY_LOCAL_Y; // -1.3 + (-0.15) = -1.45

    // Infusion conduit / pulse ring around the baby's body
    const ringGeo = new THREE.TorusGeometry(0.52, 0.03, 16, 40);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.2,
    });
    const pulseRing = new THREE.Mesh(ringGeo, ringMat);
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.set(BABY_LOCAL_X, -0.05, 0);
    patientGroup.add(pulseRing);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    // Warm bloom point light triggered on life infusion
    const bloomLight = new THREE.PointLight(0xf43f5e, 0.5, 6);
    bloomLight.position.set(BABY_LOCAL_X, -0.8, 0.5);
    scene.add(bloomLight);

    // Fluid Squash-and-Stretch Pulse Response
    let squashTimer = 0;
    const executePulse = () => {
      squashTimer = 1.0;
    };
    triggerPulseRef.current = executePulse;

    // Mouse Tracking for Raycast Hover Tilt
    let targetMouseX = 0;
    let targetMouseY = 0;
    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Read clamped scroll progress (strictly 0.0 to 1.0)
      const currentScroll = Math.min(1.0, Math.max(0.0, scrollProgress));

      // 1. Heartbeat cadence pulse
      const heartbeat = Math.pow(Math.sin(elapsedTime * 3.5), 6) * 0.12;

      // 2. Click Squash & Stretch response
      if (squashTimer > 0) {
        squashTimer -= 0.04;
      }
      const squashWave = Math.sin(squashTimer * Math.PI * 4) * squashTimer * 0.35;

      // Deform droplet geometry with fluid surface tension ripples
      const positions = dropMesh.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const ox = dropPositions[i];
        const oy = dropPositions[i + 1];
        const oz = dropPositions[i + 2];
        const ripple = Math.sin(oy * 6.0 + elapsedTime * 4.0) * 0.04 * (1 + squashTimer * 2);
        positions[i] = ox * (1 + ripple + squashWave);
        positions[i + 1] = oy * (1 - squashWave * 0.8);
        positions[i + 2] = oz * (1 + ripple + squashWave);
      }
      dropMesh.geometry.attributes.position.needsUpdate = true;
      dropMesh.geometry.computeVertexNormals();

      // 3. Downward Scroll Trajectory (Life Infusion towards Baby Body)
      // The orb starts high (Y = 1.75) and descends exactly to BABY_BODY_WORLD_Y (-1.45)
      const START_Y = 1.75;
      const TARGET_Y = BABY_BODY_WORLD_Y; // -1.45: Center of the dark blue baby body shape

      // Eased downward progression
      const t = currentScroll;
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Calculate calculated Y, clamped strictly with Math.max so it NEVER scrolls past the baby's body
      const rawY = THREE.MathUtils.lerp(START_Y + Math.sin(elapsedTime * 2.0) * 0.08 * (1 - easeT), TARGET_Y, easeT);
      const clampedOrbY = Math.max(TARGET_Y, rawY);

      // X curves slightly along a curved spline then centers on baby body
      const orbX = (1 - easeT) * (targetMouseX * 0.25) + Math.sin(t * Math.PI) * 0.35 + easeT * BABY_BODY_WORLD_X;
      const orbZ = Math.sin(t * Math.PI) * 0.3;

      dropletGroup.position.set(orbX, clampedOrbY, orbZ);

      // Scale droplet: shrinks slightly as it merges into the infusion conduit
      const scaleFactor = Math.max(0.05, (1 - easeT * 0.55) * (1 + heartbeat + squashWave));
      dropletGroup.scale.setScalar(scaleFactor);

      // Rotations
      dropMesh.rotation.y = elapsedTime * (0.8 + easeT * 1.5) + targetMouseX * 0.3;
      dropMesh.rotation.x = targetMouseY * 0.2;
      dropMesh.rotation.z = Math.sin(elapsedTime * 1.5) * 0.1;
      leafAura.rotation.z = elapsedTime * 0.8;
      leafAura2.rotation.z = -elapsedTime * 0.6;
      innerCore.rotation.y = -elapsedTime * 1.5;

      // Particle stream emits along downward velocity
      particleTrail.material.opacity = 0.85 + easeT * 0.15;
      particleTrail.rotation.y = elapsedTime * 2.5;

      // 4. Life Infusion Interaction with Baby
      if (currentScroll >= 0.75) {
        // Orb has reached the baby's body!
        const arrivalProgress = Math.min(1.0, (currentScroll - 0.75) / 0.25);

        // Infusion pulse ring expands around the baby
        const ringPulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.25 + arrivalProgress * 0.5;
        pulseRing.scale.setScalar(ringPulse);
        pulseRing.material.opacity = 0.5 + arrivalProgress * 0.4;

        // Warm bloom lighting radiates from the infusion point
        bloomLight.intensity = 2.0 + arrivalProgress * 2.5 + Math.sin(elapsedTime * 3.0) * 0.8;
        bloomLight.color.setHex(0xf43f5e);

        // Dark blue shape of the baby body gradually vitalizes into warm glowing life!
        patientMat.color.lerpColors(new THREE.Color(0x1e293b), new THREE.Color(0xf43f5e), arrivalProgress);
        patientMat.emissive.lerpColors(new THREE.Color(0x0a1122), new THREE.Color(0x881337), arrivalProgress);
      } else {
        // Before reaching baby
        pulseRing.scale.setScalar(1.0);
        pulseRing.material.opacity = 0.15;
        bloomLight.intensity = 0.3 + easeT * 1.0;
        patientMat.color.setHex(0x1e293b);
        patientMat.emissive.setHex(0x0a1122);
      }

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
      dropGeometry.dispose();
      dropMaterial.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      bedGeo.dispose();
      bedMat.dispose();
      legGeo.dispose();
      legMat.dispose();
      pillowGeo.dispose();
      headGeo.dispose();
      bodyGeo.dispose();
      patientMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [scrollProgress]);

  const handlePulseClick = () => {
    if (triggerPulseRef.current) {
      triggerPulseRef.current();
    }
  };

  if (!webGLSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-44 h-44 mb-6">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-rose-600 to-cyan-500 p-1 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.4)]">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
              <span className="text-5xl animate-bounce">🩸</span>
              <span className="text-xs font-bold text-rose-400 mt-2">Life Droplet</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-xs">
          Interactive life infusion stream active. Every second connects donors to waiting pediatric patients.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 
        FIXED BACKGROUND ANIMATION LAYER:
        - Moved to position: fixed and z-index: -1
        - Sits behind all landing page text
        - Soft, glowing out-of-focus background effect with heavy 16px blur (target 12-20px)
        - Hardware accelerated via translateZ(0) to prevent lag
      */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none"
        style={{
          zIndex: -1,
          filter: 'blur(16px)',
          WebkitFilter: 'blur(16px)',
          transform: 'translateZ(0)',
          willChange: 'filter, transform',
          opacity: 0.82,
        }}
      />

      {/* 
        FOREGROUND INTERACTIVE UI OVERLAY:
        - Sits above the background animation (z-index: 10)
        - Preserves the "Scroll to guide the life infusion • Click to pulse droplet" text
        - Features the circular UI button for triggering the pulse animation
        - Fully clickable and visible without interference
      */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center sm:justify-end pb-8 gap-4 pointer-events-auto">
        {/* Circular UI Button to pulse the droplet */}
        <button
          onClick={handlePulseClick}
          className="group relative w-14 h-14 rounded-full glass-panel border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.35)] cursor-pointer"
          title="Click to pulse droplet"
          aria-label="Pulse blood droplet"
        >
          {/* Animated pulsing halo ring */}
          <span className="absolute inset-0 rounded-full border border-rose-500/40 animate-ping opacity-40 pointer-events-none" />
          <Droplet className="w-6 h-6 text-rose-500 fill-rose-500/80 group-hover:scale-110 transition-transform" />
        </button>

        {/* Interactive Micro-badge with status text */}
        <div
          onClick={handlePulseClick}
          className="glass-panel px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-lg cursor-pointer hover:border-rose-500/40 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>
            {scrollProgress < 0.3
              ? 'Scroll to guide the life infusion • Click to pulse droplet'
              : scrollProgress < 0.75
              ? 'Transfusion conduit accelerating to patient'
              : '✨ Life restored: Pediatric match successful!'}
          </span>
        </div>
      </div>
    </>
  );
}
