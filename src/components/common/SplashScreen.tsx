"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./SplashScreen.module.css";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if the splash screen has already been shown in this session
    const hasShown = sessionStorage.getItem("splashShown");
    if (hasShown) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    // Ultimate fallback in case the video fails to load or play
    let timeout: NodeJS.Timeout;
    if (showSplash && !isFading) {
      timeout = setTimeout(() => {
        handleVideoEnd();
      }, 15000); // 15 seconds absolute max (video is 10.3s long)
    }
    return () => clearTimeout(timeout);
  }, [showSplash, isFading]);

  const handleVideoEnd = () => {
    if (isFading) return;
    setIsFading(true);
    
    // Wait for fade out animation before completely hiding
    setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("splashShown", "true");
    }, 400); // matches the transition duration in css
  };

  if (!showSplash) return null;

  return (
    <div className={`${styles.splashContainer} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          src="/kickat-logo-animation.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoEnd}
          className={styles.video}
        />
      </div>
    </div>
  );
}
