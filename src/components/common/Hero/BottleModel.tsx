"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from 'three';

// Preload the model for faster rendering
useGLTF.preload("/cat shampoo bottle 3d model.glb");

export function BottleModel() {
  const { scene } = useGLTF("/cat shampoo bottle 3d model.glb");
  const modelRef = useRef<THREE.Group>(null);

  // Slowly rotate the model over time for a premium showcase feel
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <PresentationControls
      global
      config={{ mass: 1, tension: 170, friction: 26 }}
      snap={{ mass: 2, tension: 300 }} // Snap back to center
      rotation={[0, -0.3, 0]} // Initial rotation
      polar={[-0.1, 0.1]} // Restrict vertical rotation
      azimuth={[-Math.PI / 2, Math.PI / 2]} // Restrict horizontal rotation
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.05, 0.05]}>
        <primitive 
          ref={modelRef}
          object={scene} 
          position={[0, -0.6, 0]} // Adjusted Y position to match new scale
          scale={4.5} // Reduced scale significantly to fit properly in the hero section
        />
      </Float>
      
      {/* Realistic contact shadow under the bottle */}
      <ContactShadows 
        position={[0, -0.9, 0]} 
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
