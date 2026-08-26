"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from 'three';

// Preload both models for faster rendering
useGLTF.preload("/cat shampoo bottle 3d model.glb");
useGLTF.preload("/dog shampoo bottle 3d model.glb");

// Animated wrapper for a single bottle
function AnimatedBottle({ scene, isActive, targetScale, targetPosition }: { scene: THREE.Group, isActive: boolean, targetScale: number, targetPosition: [number, number, number] }) {
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    
    // Always interpolate towards the full targetScale (no shrinking)
    modelRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
    
    // When inactive, face away (Math.PI). When active, face front (0).
    const targetRotation = isActive ? 0 : Math.PI; 
    modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRotation, delta * 5);
    
    // Only show the bottle when it is facing the front (rotation < 90 degrees)
    // This creates a perfect card-flip transition without overlapping!
    const isFacingFront = Math.abs(modelRef.current.rotation.y) < Math.PI / 2;
    modelRef.current.visible = isFacingFront;
  });

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      position={targetPosition} 
      scale={0} // Start at 0 so it pops in on initial mount
      rotation={[0, Math.PI, 0]} // Start facing away
    />
  );
}

export function BottleModel() {
  const { scene: catScene } = useGLTF("/cat shampoo bottle 3d model.glb");
  const { scene: dogScene } = useGLTF("/dog shampoo bottle 3d model.glb");
  
  const [activeModel, setActiveModel] = useState<'cat' | 'dog'>('cat');

  // Auto-switch models every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModel(prev => prev === 'cat' ? 'dog' : 'cat');
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PresentationControls
      snap={true} // Snap back to center
      rotation={[0, -0.3, 0]} // Initial rotation
      polar={[-0.1, 0.1]} // Restrict vertical rotation
      azimuth={[-Math.PI / 2, Math.PI / 2]} // Restrict horizontal rotation
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.05, 0.05]}>
        {/* Render both models simultaneously to allow for cross-animations */}
        <AnimatedBottle scene={catScene} isActive={activeModel === 'cat'} targetScale={5.5} targetPosition={[0, -2.3, 0]} />
        <AnimatedBottle scene={dogScene} isActive={activeModel === 'dog'} targetScale={5.5} targetPosition={[0, -2.3, 0]} />
      </Float>
        
      {/* Realistic contact shadow under the bottle */}
      <ContactShadows 
        position={[0, -2.6, 0]} 
        opacity={0.3} 
        scale={10} 
        blur={2} 
        far={2} 
        color="#000000"
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
