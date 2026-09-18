"use client";

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser scroll restoration to prevent jumping down on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll to top on mount
    window.scrollTo(0, 0);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      autoResize: true,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // ResizeObserver to observe document body height changes (e.g. dynamic profile/orders data loading)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // On route / pathname change, reset scroll position & update Lenis page height dimensions
  useEffect(() => {
    if (!lenisRef.current) return;

    const lenis = lenisRef.current;
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    const t1 = setTimeout(() => lenis.resize(), 50);
    const t2 = setTimeout(() => lenis.resize(), 200);
    const t3 = setTimeout(() => lenis.resize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  // Keyboard navigation listener (ArrowDown, ArrowUp, PageDown, PageUp, Space, Home, End)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (!lenisRef.current) return;
      const lenis = lenisRef.current;

      const step = 100;
      const pageStep = window.innerHeight * 0.8;

      if (e.key === 'ArrowDown') {
        lenis.scrollTo(lenis.scroll + step);
      } else if (e.key === 'ArrowUp') {
        lenis.scrollTo(lenis.scroll - step);
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        lenis.scrollTo(lenis.scroll + pageStep);
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        lenis.scrollTo(lenis.scroll - pageStep);
      } else if (e.key === 'Home') {
        e.preventDefault();
        lenis.scrollTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        lenis.scrollTo(lenis.limit);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
