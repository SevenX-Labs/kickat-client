"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dog, Cat, Bone, Fish, Bird } from "lucide-react";
import styles from "./SplashScreen.module.css";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show the premium loader on every refresh for a brief, satisfying moment
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setShowSplash(false), 600); // Matches CSS transition duration
    }, 2500); // 2.5s loading animation to appreciate the icons

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
            width={240}
            height={240}
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
