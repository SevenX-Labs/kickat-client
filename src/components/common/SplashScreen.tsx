"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dog, Cat, Bone, Fish, Bird } from "lucide-react";
import styles from "./SplashScreen.module.css";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only show splash screen once per session
    if (sessionStorage.getItem("splashShown")) {
      setShowSplash(false);
      return;
    }

    let isDismissed = false;
    const dismissSplash = () => {
      if (isDismissed) return;
      isDismissed = true;
      setIsFading(true);
      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("splashShown", "true");
      }, 500); // Smooth 500ms fade transition
    };

    // If page document is already loaded, allow short cinematic preview (~1.2s) then fade
    if (document.readyState === "complete") {
      const minTimer = setTimeout(dismissSplash, 1200);
      return () => clearTimeout(minTimer);
    } else {
      const handleLoad = () => {
        setTimeout(dismissSplash, 600);
      };
      window.addEventListener("load", handleLoad);
      // Safety max fallback timer so loader never gets stuck
      const maxTimer = setTimeout(dismissSplash, 2400);

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(maxTimer);
      };
    }
  }, []);

  if (!showSplash) return null;

  return (
    <div className={`${styles.splashContainer} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.loaderContent}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logo-clean.png"
            alt="KickAt Logo"
            width={360}
            height={360}
            className={styles.actualLogo}
            priority
          />
        </div>
        
        {/* Premium Pet Icons Wave */}
        <div className={styles.iconRow}>
          <Dog strokeWidth={1.5} className={styles.petIcon} />
          <Cat strokeWidth={1.5} className={styles.petIcon} />
          <Bone strokeWidth={1.5} className={styles.petIcon} />
          <Fish strokeWidth={1.5} className={styles.petIcon} />
          <Bird strokeWidth={1.5} className={styles.petIcon} />
        </div>
      </div>
    </div>
  );
}
