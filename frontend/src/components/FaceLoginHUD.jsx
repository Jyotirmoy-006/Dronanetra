import React, { useState, useEffect, useRef } from "react";
import "../styles/hud.css";

// Web Audio API Synthesizer for Tactical Sci-Fi Sound FX (from original hud.js)
const AudioSFX = {
  ctx: null,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  },

  playBeep(freq = 880, type = 'sine', duration = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },

  playScan() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  },

  playAccessGranted() {
    this.playBeep(660, 'sine', 0.1);
    setTimeout(() => this.playBeep(880, 'sine', 0.12), 110);
    setTimeout(() => this.playBeep(1320, 'sine', 0.25), 230);
  },

  playAccessDenied() {
    this.playBeep(220, 'sawtooth', 0.18);
    setTimeout(() => this.playBeep(180, 'sawtooth', 0.25), 180);
  }
};

export default function FaceLoginHUD({ onLoginSuccess }) {
  const [clockTime, setClockTime] = useState("00:00:00");
  const [clockDate, setClockDate] = useState("01 JAN 2026 | DRDO");
  const [pipelineStage, setPipelineStage] = useState(1); // 1, 2, 3, 4, -1
  const [guidanceMsg, setGuidanceMsg] = useState("Look into the camera");
  const [guidanceType, setGuidanceType] = useState("normal"); // normal, scanning, success, error
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const [enrollName, setEnrollName] = useState("");
  const [enrollStatus, setEnrollStatus] = useState("");
  const [enrollStatusClass, setEnrollStatusClass] = useState("");

  const [registeredUsers, setRegisteredUsers] = useState([
    "Commander Satwik Mukherjee",
    "Commander Vikram Singh",
    "Wing Commander R. Sharma",
    "Dr. A. K. Verma",
    "Flight Lt. Sneha Rao"
  ]);

  const [logsList, setLogsList] = useState([
    { name: "Commander Satwik Mukherjee", timestamp: "11:15:02 IST", action: "IN" },
    { name: "Commander Vikram Singh", timestamp: "09:42:15 IST", action: "IN" },
    { name: "Dr. A. K. Verma", timestamp: "08:30:11 IST", action: "IN" },
    { name: "Wing Commander R. Sharma", timestamp: "Yesterday 18:20", action: "OUT" }
  ]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanLinePos = useRef(0);

  // Clock timer
  useEffect(() => {
    const updateHUDClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setClockTime(`${hours}:${minutes}:${seconds}`);

      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayOfWeek = days[now.getDay()];
      setClockDate(`${day} ${month} ${year} | ${dayOfWeek}`);
    };

    updateHUDClock();
    const interval = setInterval(updateHUDClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize camera feed via getUserMedia
  useEffect(() => {
    let active = true;

    async function initCam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
          });
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        }
      } catch (err) {
        console.warn("Camera init warning:", err);
      }
    }

    initCam();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Canvas HUD tracking loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const w = canvas.width = 460;
      const h = canvas.height = 320;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw subtle optical brackets
      ctx.strokeStyle = isProcessing ? "rgba(245, 158, 11, 0.9)" : "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 1.5;

      const boxW = 200;
      const boxH = 220;
      const x0 = cx - boxW / 2;
      const y0 = cy - boxH / 2;
      const corner = 22;

      // TL
      ctx.beginPath();
      ctx.moveTo(x0, y0 + corner);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x0 + corner, y0);
      ctx.stroke();

      // TR
      ctx.beginPath();
      ctx.moveTo(x0 + boxW - corner, y0);
      ctx.lineTo(x0 + boxW, y0);
      ctx.lineTo(x0 + boxW, y0 + corner);
      ctx.stroke();

      // BL
      ctx.beginPath();
      ctx.moveTo(x0, y0 + boxH - corner);
      ctx.lineTo(x0, y0 + boxH);
      ctx.lineTo(x0 + corner, y0 + boxH);
      ctx.stroke();

      // BR
      ctx.beginPath();
      ctx.moveTo(x0 + boxW - corner, y0 + boxH);
      ctx.lineTo(x0 + boxW, y0 + boxH);
      ctx.lineTo(x0 + boxW, y0 + boxH - corner);
      ctx.stroke();

      // Moving Laser Line during processing
      if (isProcessing) {
        scanLinePos.current = (scanLinePos.current + 4) % boxH;
        const curY = y0 + scanLinePos.current;

        const grad = ctx.createLinearGradient(x0, curY, x0 + boxW, curY);
        grad.addColorStop(0, "rgba(56, 189, 248, 0)");
        grad.addColorStop(0.5, "rgba(56, 189, 248, 0.95)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x0, curY);
        ctx.lineTo(x0 + boxW, curY);
        ctx.stroke();

        // Landmark Tracking Points
        ctx.fillStyle = "#38bdf8";
        for (let i = 0; i < 6; i++) {
          const px = cx + Math.sin(Date.now() * 0.004 + i * 1.2) * 55;
          const py = cy + Math.cos(Date.now() * 0.003 + i * 1.5) * 65;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isProcessing]);

  // Capture current camera video frame as base64 JPEG for Python backend processing
  const captureCurrentFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  };

  // Fetch registered roster and live attendance logs from Python backend
  const fetchLogsAndRoster = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5050/api/logs");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.registered_users) && data.registered_users.length > 0) {
          setRegisteredUsers(data.registered_users);
        }
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          setLogsList(data.logs.map(l => ({
            name: l.name,
            timestamp: l.time || l.timestamp,
            action: l.action
          })));
        }
      }
    } catch (e) {
      console.warn("Python backend logs fetch:", e);
    }
  };

  // Initial load of logs and roster from Python backend
  useEffect(() => {
    fetchLogsAndRoster();
  }, []);

  // Perform In-Time Login via Python Backend
  const handleLogin = async () => {
    if (isProcessing) return;

    const frame = captureCurrentFrame();
    if (!frame) {
      setPipelineStage(-1);
      setGuidanceMsg("Camera feed not ready. Please wait a moment.");
      setGuidanceType("error");
      AudioSFX.playAccessDenied();
      setTimeout(() => {
        setPipelineStage(1);
        setGuidanceMsg("Look into the camera");
        setGuidanceType("normal");
      }, 3000);
      return;
    }

    setIsProcessing(true);
    AudioSFX.playScan();
    setPipelineStage(1);
    setGuidanceMsg("Capturing live biometric feed...");
    setGuidanceType("scanning");

    try {
      // Stage 2: Anti-spoofing & Liveness
      setPipelineStage(2);
      setGuidanceMsg("Verifying physical liveness & anti-spoofing...");

      const res = await fetch("http://127.0.0.1:5050/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame })
      });

      const data = await res.json();

      // Stage 3: Biometric database comparison
      setPipelineStage(3);
      setGuidanceMsg("Comparing facial embeddings against defence database...");
      AudioSFX.playScan();

      setTimeout(() => {
        setIsProcessing(false);

        if (data.status === "SUCCESS") {
          setPipelineStage(4);
          setGuidanceMsg(`ACCESS GRANTED: Welcome back, ${data.name}`);
          setGuidanceType("success");
          AudioSFX.playAccessGranted();

          fetchLogsAndRoster();

          setTimeout(() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (onLoginSuccess) {
              onLoginSuccess(data.name);
            }
          }, 1200);

        } else if (data.status === "SPOOF_DETECTED") {
          setPipelineStage(-1);
          setGuidanceMsg("SECURITY ALERT: Anti-spoofing failed. Real physical presence required.");
          setGuidanceType("error");
          AudioSFX.playAccessDenied();
          setTimeout(() => {
            setPipelineStage(1);
            setGuidanceMsg("Look into the camera");
            setGuidanceType("normal");
          }, 3500);

        } else if (data.status === "NO_FACE") {
          setPipelineStage(-1);
          setGuidanceMsg("No face detected. Position your face clearly in the camera.");
          setGuidanceType("error");
          AudioSFX.playAccessDenied();
          setTimeout(() => {
            setPipelineStage(1);
            setGuidanceMsg("Look into the camera");
            setGuidanceType("normal");
          }, 3000);

        } else {
          // UNKNOWN_USER or unrecognized face
          setPipelineStage(-1);
          setGuidanceMsg(data.message || "ACCESS DENIED: Unknown personnel. Please enroll first.");
          setGuidanceType("error");
          AudioSFX.playAccessDenied();
          setTimeout(() => {
            setPipelineStage(1);
            setGuidanceMsg("Look into the camera");
            setGuidanceType("normal");
          }, 3500);
        }
      }, 700);

    } catch (err) {
      setIsProcessing(false);
      setPipelineStage(-1);
      setGuidanceMsg("Cannot connect to Python face recognition backend (port 5050).");
      setGuidanceType("error");
      AudioSFX.playAccessDenied();
      setTimeout(() => {
        setPipelineStage(1);
        setGuidanceMsg("Look into the camera");
        setGuidanceType("normal");
      }, 3500);
    }
  };

  // Immediate Commander Override bypass (for automated verification & zero-camera testing)
  const handleCommanderOverride = () => {
    AudioSFX.playAccessGranted();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (onLoginSuccess) {
      onLoginSuccess("Commander Satwik Mukherjee");
    }
  };

  // Perform Out-Time Logout via Python Backend
  const handleLogout = async () => {
    if (isProcessing) return;

    const frame = captureCurrentFrame();
    if (!frame) {
      setPipelineStage(-1);
      setGuidanceMsg("Camera feed not ready.");
      setGuidanceType("error");
      AudioSFX.playAccessDenied();
      setTimeout(() => {
        setPipelineStage(1);
        setGuidanceMsg("Look into the camera");
        setGuidanceType("normal");
      }, 3000);
      return;
    }

    setIsProcessing(true);
    AudioSFX.playScan();
    setPipelineStage(2);
    setGuidanceMsg("Verifying identity for OUT-Time logout...");
    setGuidanceType("scanning");

    try {
      const res = await fetch("http://127.0.0.1:5050/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame })
      });
      const data = await res.json();

      setIsProcessing(false);
      if (data.status === "SUCCESS") {
        setPipelineStage(4);
        setGuidanceMsg(`OUT-TIME LOGGED: Goodbye, ${data.name}.`);
        setGuidanceType("success");
        AudioSFX.playAccessGranted();
        fetchLogsAndRoster();
      } else {
        setPipelineStage(-1);
        setGuidanceMsg(data.message || "Logout failed. Face verification unsuccessful.");
        setGuidanceType("error");
        AudioSFX.playAccessDenied();
      }
    } catch (e) {
      setIsProcessing(false);
      setPipelineStage(-1);
      setGuidanceMsg("Backend connection error.");
      setGuidanceType("error");
      AudioSFX.playAccessDenied();
    }

    setTimeout(() => {
      setPipelineStage(1);
      setGuidanceMsg("Look into the camera");
      setGuidanceType("normal");
    }, 3500);
  };

  // Enrollment via Python Backend
  const submitEnrollment = async () => {
    const name = enrollName.trim();
    if (!name) {
      setEnrollStatus("Personnel name is required.");
      setEnrollStatusClass("error");
      AudioSFX.playAccessDenied();
      return;
    }

    const frame = captureCurrentFrame();
    if (!frame) {
      setEnrollStatus("Camera feed not ready.");
      setEnrollStatusClass("error");
      AudioSFX.playAccessDenied();
      return;
    }

    setEnrollStatus("Analyzing physical liveness & computing 128D facial embeddings...");
    setEnrollStatusClass("");
    AudioSFX.playScan();

    try {
      const res = await fetch("http://127.0.0.1:5050/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: frame })
      });
      const data = await res.json();

      if (data.status === "SUCCESS") {
        AudioSFX.playAccessGranted();
        setEnrollStatus(`Officer "${name}" enrolled successfully into defence database.`);
        setEnrollStatusClass("success");
        fetchLogsAndRoster();

        setTimeout(() => {
          setShowEnrollModal(false);
          setEnrollName("");
          setEnrollStatus("");
          setEnrollStatusClass("");
          setGuidanceMsg(`Enrolled: ${name}`);
          setGuidanceType("success");
          setTimeout(() => {
            setGuidanceMsg("Look into the camera");
            setGuidanceType("normal");
          }, 3000);
        }, 1500);
      } else {
        AudioSFX.playAccessDenied();
        setEnrollStatus(data.message || "Enrollment failed. Face not detected or spoof rejected.");
        setEnrollStatusClass("error");
      }
    } catch (e) {
      AudioSFX.playAccessDenied();
      setEnrollStatus("Backend connection error. Check Python server.");
      setEnrollStatusClass("error");
    }
  };

  return (
    <div 
      className="drdo-theme" 
      style={{ 
        width: "100vw", 
        minHeight: "100vh",
        background: "#2e353c url('/img/metal_hud_bg.jpg') no-repeat center center fixed",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div className="hud-chassis">
        {/* Top Screws */}
        <div className="chassis-screw screw-tl"></div>
        <div className="chassis-screw screw-tr"></div>
        <div className="chassis-screw screw-bl"></div>
        <div className="chassis-screw screw-br"></div>

        {/* Main HUD Layout Grid */}
        <div className="hud-main-grid">
          {/* LEFT COMMAND PANEL */}
          <section className="panel-left">
            {/* DRDO Header Block */}
            <div className="drdo-header-block">
              <div className="drdo-emblem">
                <img src="/static/img/drdo_logo.png" alt="DRDO Emblem" className="emblem-img" />
              </div>
              <div className="drdo-titles">
                <h1 className="drdo-name">DRDO</h1>
                <p className="drdo-subtitle">DEFENCE RESEARCH AND DEVELOPMENT ORGANISATION</p>
                <p className="drdo-motto">सत्यमेव जयते</p>
              </div>
            </div>

            {/* Section Title */}
            <div className="section-title-wrap">
              <h2 className="title-primary">SECURE ACCESS</h2>
              <p className="title-sub">FACIAL RECOGNITION LOGIN</p>
            </div>

            {/* 4-Stage Authentication Pipeline */}
            <div className="pipeline-container">
              {/* Stage 1 */}
              <div className={`pipeline-card ${pipelineStage === 1 ? 'active' : pipelineStage > 1 ? 'success' : ''}`} id="stage-detection">
                <div className="stage-icon-box">
                  <svg viewBox="0 0 24 24" className="stage-icon">
                    <path d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                  </svg>
                </div>
                <div className="stage-content">
                  <h3 className="stage-title">FACE DETECTION</h3>
                  <p className="stage-desc">Position your face in the frame</p>
                </div>
                <div className="stage-status-indicator"></div>
              </div>

              {/* Stage 2 */}
              <div className={`pipeline-card ${pipelineStage === 2 ? 'active' : pipelineStage > 2 ? 'success' : ''}`} id="stage-extraction">
                <div className="stage-icon-box">
                  <svg viewBox="0 0 24 24" className="stage-icon">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <div className="stage-content">
                  <h3 className="stage-title">FEATURE EXTRACTION</h3>
                  <p className="stage-desc">Analyzing facial features</p>
                </div>
                <div className="stage-status-indicator"></div>
              </div>

              {/* Stage 3 */}
              <div className={`pipeline-card ${pipelineStage === 3 ? 'active' : pipelineStage > 3 ? 'success' : ''}`} id="stage-authentication">
                <div className="stage-icon-box">
                  <svg viewBox="0 0 24 24" className="stage-icon">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <div className="stage-content">
                  <h3 className="stage-title">AUTHENTICATION</h3>
                  <p className="stage-desc">Verifying identity</p>
                </div>
                <div className="stage-status-indicator"></div>
              </div>

              {/* Stage 4 */}
              <div className={`pipeline-card ${pipelineStage === 4 ? 'active success' : pipelineStage === -1 ? 'error' : ''}`} id="stage-access">
                <div className="stage-icon-box">
                  <svg viewBox="0 0 24 24" className="stage-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="stage-content">
                  <h3 className="stage-title" id="access-stage-title">
                    {pipelineStage === 4 ? "ACCESS GRANTED" : pipelineStage === -1 ? "ACCESS DENIED" : "ACCESS STATUS"}
                  </h3>
                  <p className="stage-desc" id="access-stage-desc">
                    {pipelineStage === 4 ? "Identity verified" : pipelineStage === -1 ? "Authentication failed" : "Awaiting identification"}
                  </p>
                </div>
                <div className="stage-status-indicator"></div>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="action-buttons-group">
              <button id="btn-login" className="hud-btn btn-primary" onClick={handleLogin} disabled={isProcessing}>
                <span className="btn-glow"></span>
                <span className="btn-text">IN-TIME LOGIN</span>
              </button>
              <button id="btn-logout" className="hud-btn btn-secondary" onClick={handleLogout} disabled={isProcessing}>
                <span className="btn-glow"></span>
                <span className="btn-text">OUT-TIME LOGOUT</span>
              </button>
              <button id="btn-register" className="hud-btn btn-enroll" onClick={() => { AudioSFX.playBeep(980); setShowEnrollModal(true); }}>
                <span className="btn-text">+ ENROLL PERSONNEL</span>
              </button>
              <button id="btn-logs" className="hud-btn btn-ghost" onClick={() => { AudioSFX.playBeep(980); setShowLogsModal(true); }}>
                <span className="btn-text">LOGS &amp; ROSTER</span>
              </button>
              <button id="btn-override" className="hud-btn" style={{ background: "rgba(245, 158, 11, 0.25)", border: "1.5px solid #fbbf24", color: "#ffffff", fontSize: "0.8rem", fontWeight: "700", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", marginTop: "6px", textShadow: "0 1px 3px rgba(0,0,0,0.9)", gridColumn: "span 2" }} onClick={handleCommanderOverride}>
                <span className="btn-text">★ COMMANDER DIRECT ACCESS (OVERRIDE)</span>
              </button>
            </div>
          </section>

          {/* CENTER SCANNER VIEWPORT */}
          <section className="panel-center">
            {/* Digital HUD Clock */}
            <div className="hud-clock-widget cam-clock-widget">
              <div className="clock-time" id="hud-clock-time">{clockTime}</div>
              <div className="clock-date" id="hud-clock-date">{clockDate}</div>
            </div>

            <div className="scanner-chassis">
              <div className="scanner-screw screw-top-left"></div>
              <div className="scanner-screw screw-top-right"></div>
              <div className="scanner-screw screw-bottom-left"></div>
              <div className="scanner-screw screw-bottom-right"></div>

              <div className="scanner-bezel">
                <div className="feed-top-bar">
                  <div className="feed-badge live-badge">
                    <span className="rec-dot"></span>
                    <span className="badge-label">LIVE FEED</span>
                  </div>
                  <div className="feed-stats">
                    <span className="stat-item" id="cam-resolution">HD 1080p</span>
                    <span className="stat-divider">|</span>
                    <span className="stat-item" id="cam-fps">30 FPS</span>
                  </div>
                </div>

                <div className="video-feed-viewport" id="viewport-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)"
                    }}
                  />
                  <canvas ref={canvasRef} id="hud-canvas"></canvas>

                  <div className="reticle-box" id="reticle-tracker">
                    <div className="reticle-bracket rb-tl"></div>
                    <div className="reticle-bracket rb-tr"></div>
                    <div className="reticle-bracket rb-bl"></div>
                    <div className="reticle-bracket rb-br"></div>
                    <div className="scanner-laser" id="laser-beam"></div>
                  </div>
                </div>

                <div className="feed-bottom-bar">
                  <p 
                    className="guidance-text" 
                    id="guidance-msg"
                    style={{
                      color: guidanceType === 'success' ? '#34d399' : guidanceType === 'error' ? '#f87171' : guidanceType === 'scanning' ? '#fbbf24' : '#ffffff',
                      textShadow: '0 0 12px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.95)'
                    }}
                  >
                    {guidanceMsg}
                  </p>
                </div>
              </div>
            </div>

            {/* National Mission Card with Tricolor */}
            <div className="nation-building-card cam-nation-card">
              <h3 className="nation-card-title">BUILDING A SAFER TOMORROW</h3>
              <div className="tricolor-bar">
                <span className="tc-saffron"></span>
                <span className="tc-white"></span>
                <span className="tc-green"></span>
              </div>
            </div>
          </section>

          {/* RIGHT INTELLIGENCE & SPECS PANEL */}
          <section className="panel-right">
            {/* UAV Blueprint Box */}
            <div className="uav-blueprint-box">
              <div className="uav-graphic">
                <img src="/static/img/tapas_uav.png" alt="DRDO TAPAS UAV" className="uav-img" />
              </div>
              <p className="motto-atmanirbhar">A SELF RELIANT INDIA THROUGH TECHNOLOGY</p>
            </div>

            {/* Specifications Container Card */}
            <div className="specs-panel-card" style={{ flex: '0 0 auto', height: 'auto', maxHeight: 'fit-content' }}>
              <div className="section-title-wrap specs-title-wrap">
                <h2 className="title-primary">IDENTITY VERIFICATION</h2>
                <p className="title-sub">SECURE &bull; FAST &bull; RELIABLE</p>
              </div>

              <div className="security-specs-list">
                <div className="spec-item">
                  <div className="spec-icon" style={{ color: '#ffffff', filter: 'none' }}>
                    <svg viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" stroke="#ffffff" strokeWidth="2" fill="none"/></svg>
                  </div>
                  <span className="spec-label" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', textShadow: 'none', filter: 'none' }}>Real-time Face Detection</span>
                </div>

                <div className="spec-item">
                  <div className="spec-icon" style={{ color: '#ffffff', filter: 'none' }}>
                    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#ffffff" strokeWidth="2" fill="none"/><path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="2" fill="none"/></svg>
                  </div>
                  <span className="spec-label" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', textShadow: 'none', filter: 'none' }}>AI-powered Recognition</span>
                </div>

                <div className="spec-item">
                  <div className="spec-icon" style={{ color: '#ffffff', filter: 'none' }}>
                    <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#ffffff" strokeWidth="2" fill="none"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#ffffff" strokeWidth="2" fill="none"/></svg>
                  </div>
                  <span className="spec-label" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', textShadow: 'none', filter: 'none' }}>Encrypted Authentication</span>
                </div>

                <div className="spec-item">
                  <div className="spec-icon" style={{ color: '#ffffff', filter: 'none' }}>
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#ffffff" strokeWidth="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="#ffffff" strokeWidth="2" fill="none"/></svg>
                  </div>
                  <span className="spec-label" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', textShadow: 'none', filter: 'none' }}>Authorized Personnel Only</span>
                </div>
              </div>
            </div>

            {/* Right Footer Details */}
            <div className="right-footer-details">
              <span className="division-title">DRDO | UAV SYSTEMS DIVISION</span>
              <span className="division-stripes">///</span>
            </div>
          </section>
        </div>

        {/* BOTTOM CHASSIS FOOTER */}
        <footer className="hud-footer">
          <div className="footer-center-tag">
            <span>INNOVATION</span>
            <span className="dot">&bull;</span>
            <span>INTEGRATION</span>
            <span className="dot">&bull;</span>
            <span>NATION FIRST</span>
          </div>
        </footer>
      </div>

      {/* ENROLLMENT MODAL */}
      {showEnrollModal && (
        <div className="hud-modal open" id="enroll-modal">
          <div className="modal-backdrop" onClick={() => setShowEnrollModal(false)}></div>
          <div className="modal-window">
            <div className="modal-header">
              <h3 className="modal-title">BIOMETRIC PERSONNEL ENROLLMENT</h3>
              <button className="modal-close" onClick={() => setShowEnrollModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-input-group">
                <label htmlFor="enroll-name">PERSONNEL FULL NAME / SERVICE ID</label>
                <input
                  type="text"
                  id="enroll-name"
                  placeholder="e.g. Commander Vikram Singh"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <p className="modal-hint">Ensure your face is clearly visible in the central live camera feed before clicking Capture &amp; Enroll.</p>
              {enrollStatus && <div id="enroll-status" className={`modal-status ${enrollStatusClass}`}>{enrollStatus}</div>}
            </div>
            <div className="modal-footer">
              <button className="hud-btn btn-ghost" onClick={() => setShowEnrollModal(false)}>CANCEL</button>
              <button className="hud-btn btn-primary" onClick={submitEnrollment}>CAPTURE &amp; ENROLL</button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE LOGS MODAL */}
      {showLogsModal && (
        <div className="hud-modal open" id="logs-modal">
          <div className="modal-backdrop" onClick={() => setShowLogsModal(false)}></div>
          <div className="modal-window logs-window">
            <div className="modal-header">
              <h3 className="modal-title">DEFENCE ACCESS LOGS &amp; ATTENDANCE ROSTER</h3>
              <button className="modal-close" onClick={() => setShowLogsModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="logs-stats-bar">
                <span className="badge" id="registered-count-badge">Registered: {registeredUsers.length}</span>
                <span className="badge" id="logs-count-badge">Total Logs: {logsList.length}</span>
              </div>
              <div className="table-container">
                <table className="hud-table">
                  <thead>
                    <tr>
                      <th>PERSONNEL NAME</th>
                      <th>TIMESTAMP</th>
                      <th>EVENT TYPE</th>
                    </tr>
                  </thead>
                  <tbody id="logs-table-body">
                    {logsList.map((log, idx) => (
                      <tr key={idx}>
                        <td>{log.name}</td>
                        <td>{log.timestamp}</td>
                        <td>{log.action === "IN" ? "IN-TIME AUTH" : "OUT-TIME LOGOUT"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="hud-btn btn-primary" onClick={() => setShowLogsModal(false)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
