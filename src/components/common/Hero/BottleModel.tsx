"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from 'three';

// Animated wrapper for a single bottle
function AnimatedBottle({ 
  scene, 
  state, 
  baseScale, 
  baseY, 
  modelRotationOffset = 0 
}: { 
  scene: THREE.Group, 
  state: 'active' | 'next' | 'prev', 
  baseScale: number, 
  baseY: number, 
  modelRotationOffset?: number 
}) {
  const modelRef = useRef<THREE.Group>(null);

  // Compute targets based on current state
  let targetScale = baseScale;
  const targetPosition = new THREE.Vector3(0, baseY, 0);
  let targetRotation = 0;

  if (state === 'active') {
    targetScale = baseScale;
    targetPosition.set(0, baseY, 0);
    targetRotation = 0;
  } else if (state === 'next') {
    targetScale = baseScale * 0.7;
    targetPosition.set(3.5, baseY, -2.5);
    targetRotation = -0.2;
  } else {
    targetScale = 0;
    targetPosition.set(-1.5, baseY, -2);
    targetRotation = 0.5;
  }

  // Set initial position exactly once on mount to avoid popping
  const [initial] = useState(() => ({
    scale: targetScale,
    position: targetPosition.clone(),
    rotation: targetRotation
  }));

  // Pre-allocate a reusable vector to avoid GC pressure in the render loop
  const _tempVec3 = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!modelRef.current) return;
    
    const alpha = Math.min(delta * 5, 1);

    _tempVec3.current.set(targetScale, targetScale, targetScale);
    modelRef.current.scale.lerp(_tempVec3.current, alpha);
    modelRef.current.position.lerp(targetPosition, alpha);
    modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRotation, alpha);
  });

  return (
    <group 
      ref={modelRef}
      scale={initial.scale} 
      position={initial.position} 
      rotation={[0, initial.rotation, 0]} 
    >
      <primitive object={scene} rotation={[0, modelRotationOffset, 0]} />
    </group>
  );
}

interface BottleModelProps {
  isMobile?: boolean;
}

export function BottleModel({ isMobile = false }: BottleModelProps) {
  const { scene: catScene } = useGLTF("/cat-shampoo-bottle-3d-model.glb");
  const { scene: dogScene } = useGLTF("/dog-shampoo-bottle-3d-model.glb");
  // On mobile, skip the 2 heavier models (bird 3.5MB + filter 15MB) to save 18.5MB of downloads
  const { scene: birdScene } = useGLTF(isMobile ? "/cat-shampoo-bottle-3d-model.glb" : "/red-seed-feeder-3d-model.glb");
  const { scene: filterScene } = useGLTF(isMobile ? "/dog-shampoo-bottle-3d-model.glb" : "/aquarium-filter-3d-model.glb");
  
  const allModels = isMobile ? ['cat', 'dog'] : ['cat', 'dog', 'bird', 'filter'];
  const [activeModel, setActiveModel] = useState<string>('cat');

  useEffect(() => {
    if (!isMobile) {
      // Defer secondary 3D model loading until after initial hydration (desktop only)
      const timer = setTimeout(() => {
        useGLTF.preload("/red-seed-feeder-3d-model.glb");
        useGLTF.preload("/aquarium-filter-3d-model.glb");
      }, 1200);

      const interval = setInterval(() => {
        setActiveModel(prev => {
          if (prev === 'cat') return 'dog';
          if (prev === 'dog') return 'bird';
          if (prev === 'bird') return 'filter';
          return 'cat';
        });
      }, 5000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      // Mobile: only cycle between 2 models, longer interval for less CPU
      const interval = setInterval(() => {
        setActiveModel(prev => prev === 'cat' ? 'dog' : 'cat');
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  function getState(modelName: string): 'active' | 'next' | 'prev' {
    const activeIdx = allModels.indexOf(activeModel);
    const modelIdx = allModels.indexOf(modelName);
    if (activeIdx === modelIdx) return 'active';
    if ((activeIdx + 1) % allModels.length === modelIdx) return 'next';
    return 'prev';
  }

  return (
    <PresentationControls
      snap={true}
      rotation={[0, -0.3, 0]}
      polar={[-0.1, 0.1]}
      azimuth={[-Math.PI / 2, Math.PI / 2]}
    >
      <Float 
        speed={isMobile ? 1 : 1.5} 
        rotationIntensity={isMobile ? 0.05 : 0.1} 
        floatIntensity={isMobile ? 0.3 : 0.5} 
        floatingRange={[-0.05, 0.05]}
      >
        <AnimatedBottle scene={catScene} state={getState('cat')} baseScale={5.7} baseY={-3.2} />
        <AnimatedBottle scene={dogScene} state={getState('dog')} baseScale={6.2} baseY={-3.2} />
        {!isMobile && (
          <>
            <AnimatedBottle scene={birdScene} state={getState('bird')} baseScale={5.5} baseY={-2.6} modelRotationOffset={Math.PI} />
            <AnimatedBottle scene={filterScene} state={getState('filter')} baseScale={5.0} baseY={-2.6} />
          </>
        )}
      </Float>
        
      {/* Contact shadows: baked (1 frame) on both, lower resolution on mobile */}
      <ContactShadows 
        position={[0, -2.6, 0]} 
        opacity={isMobile ? 0.2 : 0.3} 
        scale={10} 
        blur={isMobile ? 1.5 : 2} 
        far={2} 
        color="#000000"
        frames={1}
        resolution={isMobile ? 128 : 256}
      />
      
      {/* On mobile: skip heavy Environment map, use simple lighting only */}
      {!isMobile && <Environment preset="studio" />}
      <ambientLight intensity={isMobile ? 0.8 : 0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      {!isMobile && <directionalLight position={[-5, 5, -5]} intensity={0.5} />}
      {!isMobile && <spotLight position={[0, 10, 0]} intensity={1} angle={0.6} penumbra={1} />}
    </PresentationControls>
  );
}
