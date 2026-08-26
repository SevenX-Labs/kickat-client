"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from 'three';

// Preload both models for faster rendering
useGLTF.preload("/cat shampoo bottle 3d model.glb");
useGLTF.preload("/dog shampoo bottle 3d model.glb");
useGLTF.preload("/red seed feeder 3d model.glb");

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
  let targetPosition = new THREE.Vector3(0, baseY, 0);
  let targetRotation = 0;

  if (state === 'active') {
    targetScale = baseScale;
    targetPosition.set(0, baseY, 0);
    targetRotation = 0;
  } else if (state === 'next') {
    targetScale = baseScale * 0.7; // Slightly smaller for depth
    targetPosition.set(3.5, baseY, -2.5); // Right and pushed back
    targetRotation = -0.2; // Slightly angled inward
  } else {
    // prev (shrinking rapidly to avoid canvas clipping)
    targetScale = 0; // Shrink to nothing
    targetPosition.set(-1.5, baseY, -2); // Move only slightly left
    targetRotation = 0.5; // Turn away
  }

  // Set initial position exactly once on mount to avoid popping
  const [initial] = useState(() => ({
    scale: targetScale,
    position: targetPosition.clone(),
    rotation: targetRotation
  }));

  useFrame((_, delta) => {
    if (!modelRef.current) return;
    
    // Clamp delta to strictly prevent massive overshoots on first load or lag spikes
    const alpha = Math.min(delta * 5, 1);

    // Smooth interpolations
    modelRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), alpha);
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

export function BottleModel() {
  const { scene: catScene } = useGLTF("/cat shampoo bottle 3d model.glb");
  const { scene: dogScene } = useGLTF("/dog shampoo bottle 3d model.glb");
  const { scene: birdScene } = useGLTF("/red seed feeder 3d model.glb");
  
  const [activeModel, setActiveModel] = useState<'cat' | 'dog' | 'bird'>('cat');
  const models = ['cat', 'dog', 'bird'];

  // Auto-switch models every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModel(prev => {
        if (prev === 'cat') return 'dog';
        if (prev === 'dog') return 'bird';
        return 'cat';
      });
    }, 5000); // 5 seconds for snappier experience
    return () => clearInterval(interval);
  }, []);

  function getState(modelName: string): 'active' | 'next' | 'prev' {
    const activeIdx = models.indexOf(activeModel);
    const modelIdx = models.indexOf(modelName);
    if (activeIdx === modelIdx) return 'active';
    if ((activeIdx + 1) % models.length === modelIdx) return 'next';
    return 'prev';
  }

  return (
    <PresentationControls
      snap={true} // Snap back to center
      rotation={[0, -0.3, 0]} // Initial rotation
      polar={[-0.1, 0.1]} // Restrict vertical rotation
      azimuth={[-Math.PI / 2, Math.PI / 2]} // Restrict horizontal rotation
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.05, 0.05]}>
        {/* Render models simultaneously to allow for cross-animations */}
        <AnimatedBottle scene={catScene} state={getState('cat')} baseScale={5.7} baseY={-3.2} />
        <AnimatedBottle scene={dogScene} state={getState('dog')} baseScale={6.2} baseY={-3.2} />
        <AnimatedBottle scene={birdScene} state={getState('bird')} baseScale={5.5} baseY={-2.6} modelRotationOffset={Math.PI} />
      </Float>
        
      {/* Realistic contact shadow under the bottle - baked for performance */}
      <ContactShadows 
        position={[0, -2.6, 0]} 
        opacity={0.3} 
        scale={10} 
        blur={2} 
        far={2} 
        color="#000000"
        frames={1}
      />
      
      {/* High-end studio lighting */}
      <Environment preset="studio" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <spotLight position={[0, 10, 0]} intensity={1} angle={0.6} penumbra={1} />
    </PresentationControls>
  );
}
