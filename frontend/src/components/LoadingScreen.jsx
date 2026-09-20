import React, { useState, useEffect, useRef } from "react";
import { Shield } from "lucide-react";

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  
  const finishedRef = useRef(false);

  useEffect(() => {
    let currentVal = 0;
    let targetVal = 0;
    let isCancelled = false;

    // Smooth organic 60FPS physics loop driving the animated bar
    let animationFrameId;
    const animateProgress = () => {
      if (isCancelled) return;
      if (currentVal < targetVal) {
        const diff = targetVal - currentVal;
        const step = Math.max(0.18, diff * 0.055);
        currentVal = Math.min(targetVal, currentVal + step);
        setProgress(Math.min(100, currentVal));
      }

      if (currentVal >= 100 && !finishedRef.current) {
        finishedRef.current = true;
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
        return;
      }

      animationFrameId = requestAnimationFrame(animateProgress);
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const preloadImg = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      });

    // PART-BY-PART STARTUP ENGINE: Sequentially charges each third of the Tricolor bar
    async function executeAllStartupTasks() {
      try {
        // ==========================================
        // PART 1: SAFFRON SECTOR (0% -> 34%)
        // Loading UI Core Assets & Telemetry Engine Bus
        // ==========================================
        targetVal = 14;
        await Promise.all([
          preloadImg("/dronanetra_logo.png"),
          preloadImg("/brushed_metal_bg.png"),
          preloadImg("/dark_metal_plate_bg.png"),
          sleep(450),
        ]);
        if (isCancelled) return;

        targetVal = 34;
        await Promise.all([
          fetch("http://127.0.0.1:8000/", { cache: "no-store" }).catch(() => {}),
          sleep(850),
        ]);
        if (isCancelled) return;

        // ==========================================
        // PART 2: WHITE / ASHOKA SECTOR (34% -> 67%)
        // Loading Engine Health, AI Anomaly Models & Fleet
        // ==========================================
        targetVal = 50;
        await Promise.all([
          fetch("http://127.0.0.1:8000/api/engine/health", { cache: "no-store" }).catch(() => {}),
          sleep(600),
        ]);
        if (isCancelled) return;

        targetVal = 67;
        await Promise.all([
          fetch("http://127.0.0.1:8000/api/alerts/", { cache: "no-store" }).catch(() => {}),
          fetch("http://127.0.0.1:8000/api/missions/", { cache: "no-store" }).catch(() => {}),
          sleep(850),
        ]);
        if (isCancelled) return;

        // ==========================================
        // PART 3: GREEN SECTOR (67% -> 100%)
        // Loading Biometric System & Pre-caching HUD Page
        // ==========================================
        targetVal = 85;
        await Promise.all([
          fetch("http://127.0.0.1:5050/api/logs", { cache: "no-store" }).catch(() => {}),
          sleep(650),
        ]);
        if (isCancelled) return;

        targetVal = 98;
        await Promise.all([
          fetch("http://127.0.0.1:5050/dashboard", { cache: "no-store" }).catch(() => {}),
          sleep(500),
        ]);
        if (isCancelled) return;

        // Final 100% Launch
        targetVal = 100;
      } catch (err) {
        targetVal = 100;
      }
    }

    executeAllStartupTasks();

    // Guaranteed fallback
    const fallbackTimer = setTimeout(() => {
      targetVal = 100;
    }, 5500);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleQuickSkip = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  return (
    <div 
      className="drdo-loading-screen"
      onClick={handleQuickSkip}
      title="Click anywhere to skip loading"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000000",
        overflow: "hidden",
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 1,
        userSelect: "none",
        cursor: "pointer"
      }}
    >
      {/* Dynamic Keyframe Styles for the Alive Tricolor Energy Pulse */}
      <style>{`
        @keyframes tricolor-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes aura-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 153, 51, 0.7)) drop-shadow(0 0 8px rgba(19, 136, 8, 0.7)); }
          50% { filter: drop-shadow(0 0 16px rgba(255, 153, 51, 0.95)) drop-shadow(0 0 16px rgba(19, 136, 8, 0.95)); }
        }
        @keyframes head-particle {
          0% { opacity: 0.7; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1.3); }
          100% { opacity: 0.7; transform: scaleY(0.8); }
        }
      `}</style>

      {/* DRDO Aerospace Hangar Background Image */}
      <img
        src="/img/hangar_loading_bg.jpg"
        alt="DRDO Aerospace Hangar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          filter: "brightness(0.92) contrast(1.05)"
        }}
      />

      {/* DRONANETRA Transparent Crystal Glass Card in the Upper Left Hangar Wall Area */}
      <div 
        style={{
          position: "absolute",
          top: "14%",
          left: "17%",
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 28px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(15, 23, 42, 0.25) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          borderTop: "1.5px solid rgba(255, 255, 255, 0.7)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}
      >
        <img
          src="/dronanetra_logo.png"
          alt="DRONANETRA"
          style={{
            height: "52px",
            width: "auto",
            maxWidth: "290px",
            objectFit: "contain",
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.75)) brightness(1.15) contrast(1.08)"
          }}
        />
      </div>

      {/* Ultra Pure Crystal Glass Card with Living Indian Tricolor Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "680px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          borderTop: "1.5px solid rgba(255, 255, 255, 0.8)",
          borderRadius: "14px",
          padding: "22px 32px 24px 32px",
          boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.45), 0 8px 32px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          zIndex: 100
        }}
      >
        {/* National Mission Headline */}
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "17px",
            fontWeight: 700,
            letterSpacing: "4.5px",
            color: "#0f172a",
            textTransform: "uppercase",
            textShadow: "0 1px 1px rgba(255, 255, 255, 0.95), 0 0 12px rgba(255, 255, 255, 0.7)",
            lineHeight: 1,
            textAlign: "center"
          }}
        >
          BUILDING A SAFER TOMORROW
        </div>

        {/* Living Indian Flag Tricolor Progress Bar */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "9px",
            background: "rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            borderRadius: "6px",
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.6)"
          }}
        >
          {/* Active Tricolor Fill with Glow Aura */}
          <div
            style={{
              position: "relative",
              height: "100%",
              width: `${progress}%`,
              borderRadius: "5px",
              background: "linear-gradient(to right, #FF9933 0%, #FF9933 33.333%, #FFFFFF 33.333%, #FFFFFF 66.666%, #138808 66.666%, #138808 100%)",
              backgroundSize: "616px 100%",
              boxShadow: "0 0 14px rgba(255, 153, 51, 0.8), 0 0 14px rgba(19, 136, 8, 0.8)",
              transition: "width 0.05s ease-out",
              overflow: "hidden",
              animation: "aura-pulse 2s infinite ease-in-out"
            }}
          >
            {/* Living High-Energy Laser Sheen Sweeping Through the Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "40%",
                height: "100%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)",
                animation: "tricolor-sweep 1.6s infinite linear"
              }}
            />

            {/* Leading Edge Glow Pulse Particle */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "6px",
                background: "#ffffff",
                boxShadow: "0 0 10px #ffffff, 0 0 20px #38bdf8",
                animation: "head-particle 1s infinite alternate"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
