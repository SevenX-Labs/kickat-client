"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { BottleModel } from "./BottleModel";

export function BottleModelCanvas() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  return (
    <Canvas 
      camera={{ position: [-1.5, 0, 8], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ 
        alpha: true, 
        antialias: false, 
        powerPreference: "high-performance",
        // Reduce precision on mobile for GPU savings
        ...(isMobile ? { precision: "lowp" as const } : {})
      }}
      dpr={isMobile ? [1, 1] : [1, 1.25]}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <BottleModel isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
