"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./SplashScreen.module.css";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 2.5 second total animation lifecycle
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setShowSplash(false), 800); // Wait for smooth fade out
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) return null;

  return (
    <div className={`${styles.splashContainer} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.loaderContent}>
        <div className={styles.logoWrapper}>
          {/* Subtle orange spark/energy accent around the paw */}
          <div className={styles.spark} />
          
          <Image
            src="/logo-clean.png"
            alt="KickAt Logo"
            width={240}
            height={240}
            className={styles.actualLogo}
            priority
          />
        </div>
      </div>
    </div>
  );
}
