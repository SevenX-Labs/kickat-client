"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { BottleModel } from "./BottleModel";

export function BottleModelCanvas() {
  return (
    <Canvas 
      camera={{ position: [-1.5, 0, 8], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.25]}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <BottleModel />
      </Suspense>
    </Canvas>
  );
}
