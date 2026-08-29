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

    // 2.8s loading animation for a more cinematic, unhurried premium feel
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("splashShown", "true");
      }, 800); // Smoother, longer fade transition
    }, 2800); 

    return () => clearTimeout(timer);
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
