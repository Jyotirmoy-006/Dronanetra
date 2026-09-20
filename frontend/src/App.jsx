import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { 
  Shield, ShieldCheck, Lock, LogOut, Radio, Activity, AlertTriangle, Clock, Film, 
  BarChart2, Cpu, Info, Bell, Settings, Home as HomeIcon, PlaySquare,
  Compass, Menu, X, Volume2, VolumeX,
  Wifi, Navigation, CloudSun, Terminal, Plane, Sliders,
  Signal, Gauge, Layers, Wrench, Eye
} from "lucide-react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DigitalTwin from "./pages/DigitalTwin";
import Analytics from "./pages/Analytics";
import FaultDetection from "./pages/FaultDetection";
import RULPrediction from "./pages/RULPrediction";
import Alerts from "./pages/Alerts";
import MissionReplay from "./pages/MissionReplay";
import Fleet from "./pages/Fleet";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import About from "./pages/About";

import LoadingScreen from "./components/LoadingScreen";
import { useEngineTelemetry } from "./hooks/useEngineTelemetry";

export default function App() {
  const { latestData, telemetryHistory, isConnected, currentFault, injectFault } = useEngineTelemetry();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [modeOpen, setModeOpen] = useState(false);
  const modeDropdownRef = useRef(null);

  // Authenticate exclusively through http://127.0.0.1:5050/dashboard
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const userParam = searchParams.get("user");
      const authParam = searchParams.get("auth");
      if (authParam === "verified" && userParam) {
        localStorage.setItem("drdo_auth_stage", "authenticated");
        localStorage.setItem("drdo_officer_name", userParam);
        // Clean URL query params without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        return userParam;
      }
    } catch (e) {}
    return localStorage.getItem("drdo_officer_name") || "Commander Satwik Mukherjee";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("auth") === "verified") {
        return true;
      }
    } catch (e) {}
    return localStorage.getItem("drdo_auth_stage") === "authenticated";
  });

  useEffect(() => {
    // Lock to White Iron theme
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  // Close mode dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target)) {
        setModeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Logout: clear auth and show the official loading screen before transitioning to face attendance
  const handleLockGCS = () => {
    localStorage.removeItem("drdo_auth_stage");
    localStorage.removeItem("drdo_officer_name");
    setIsAuthenticated(false);
  };

  const activeAlerts = latestData?.active_alerts || [];

  if (!isAuthenticated) {
    return (
      <LoadingScreen
        onComplete={() => {
          window.location.replace("http://127.0.0.1:5050/dashboard");
        }}
      />
    );
  }

  // ==========================================
  // PHASE 3: MAIN GCS WEB PLATFORM (DASHBOARD & ALL PAGES)
  // ==========================================
  return (
    <BrowserRouter>
      <div className="app-layout-sidebar" style={{ width: "100vw", minHeight: "100vh" }}>
        {/* Main Full-Width Header & Page Content */}
        <div className="main-wrapper" style={{ width: "100%", marginLeft: 0 }}>
          {/* Dronanetra Top Navigation Header — Industrial Skeuomorphic Chassis */}
          <div className="drdo-topbar-wrapper">
            <header className="drdo-topbar">
              {/* 4 Corner Screws */}
              <div className="topbar-screw topbar-screw-tl" />
              <div className="topbar-screw topbar-screw-tr" />
              <div className="topbar-screw topbar-screw-bl" />
              <div className="topbar-screw topbar-screw-br" />

              {/* Machined Top Edge Highlight Groove */}
              <div className="topbar-machined-groove" />

              {/* Left: Dronanetra Logo */}
              <div className="topbar-brand-section" style={{ minWidth: "125px", flexShrink: 0 }}>
                <img
                  src="/dronanetra_logo.png"
                  alt="Dronanetra"
                  style={{ height: "38px", width: "auto", objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
                />
              </div>

              {/* Centre: Recessed Navigation Capsule Track */}
              <nav 
                className="topbar-recessed-nav"
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
              >
                <NavLink to="/dashboard" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <HomeIcon size={13} />
                  <span>DASHBOARD</span>
                </NavLink>

                <NavLink to="/digital-twin" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <Cpu size={13} />
                  <span>DIGITAL TWIN</span>
                </NavLink>

                <NavLink to="/what-if" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <Sliders size={13} />
                  <span>WHAT-IF PLANNER</span>
                </NavLink>

                <NavLink to="/fleet" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <Plane size={13} />
                  <span>FLEET SWARM</span>
                </NavLink>

                <NavLink to="/analytics" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <BarChart2 size={13} />
                  <span>ANALYTICS</span>
                </NavLink>

                <NavLink to="/fault-detection" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <AlertTriangle size={13} />
                  <span>FAULT DETECTION</span>
                </NavLink>

                <NavLink to="/rul" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <Clock size={13} />
                  <span>RUL PREDICTION</span>
                </NavLink>

                <NavLink to="/mission-replay" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <PlaySquare size={13} />
                  <span>MISSION REPLAY</span>
                </NavLink>

                <NavLink to="/about" className={({ isActive }) => `topbar-nav-pill ${isActive ? 'active' : ''}`}>
                  <Info size={13} />
                  <span>ABOUT</span>
                </NavLink>
              </nav>

              {/* Right: Mode Selector + Officer Badge + Push Keycaps */}
              <div className="topbar-controls-section">
                {/* Engine Mode Capsule — custom glass dropdown */}
                <div className="topbar-mode-capsule" title="Active Simulation Mode / Critical Fault Injection" ref={modeDropdownRef}>
                  <Activity size={12} className="topbar-mode-icon" />
                  <span className="topbar-mode-tag">MODE:</span>

                  <button
                    className="topbar-mode-select-btn"
                    onClick={() => setModeOpen((p) => !p)}
                  >
                    {({
                      NONE: "NOMINAL OPERATING",
                      OVERHEATING: "CYLINDER OVERHEATING",
                      MISFIRE: "IGNITION MISFIRE",
                      HIGH_VIBRATION: "HIGH VIBRATION",
                      FUEL_RESTRICTION: "INJECTOR RESTRICTION",
                      SENSOR_DRIFT: "SENSOR DRIFT",
                      LUBRICATION_LOSS: "OIL PRESSURE LOSS",
                      COOLING_LOSS: "COOLING FAILURE",
                    })[currentFault || "NONE"]}
                  </button>
                  <span className="topbar-mode-chevron" style={{ transform: modeOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>

                  {modeOpen && (
                    <div className="topbar-mode-dropdown">
                      {[
                        { value: "NONE",             label: "NOMINAL OPERATING" },
                        { value: "OVERHEATING",      label: "CYLINDER OVERHEATING" },
                        { value: "MISFIRE",           label: "IGNITION MISFIRE" },
                        { value: "HIGH_VIBRATION",   label: "HIGH VIBRATION" },
                        { value: "FUEL_RESTRICTION", label: "INJECTOR RESTRICTION" },
                        { value: "SENSOR_DRIFT",     label: "SENSOR DRIFT" },
                        { value: "LUBRICATION_LOSS", label: "OIL PRESSURE LOSS" },
                        { value: "COOLING_LOSS",     label: "COOLING FAILURE" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          className={`topbar-mode-option ${(currentFault || "NONE") === value ? "active" : ""}`}
                          onClick={() => { injectFault(value); setModeOpen(false); }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Authenticated Commander Status Capsule */}
                <div className="topbar-officer-capsule" title="DRDO Biometric Security Clearance">
                  <Shield size={13} className="topbar-officer-shield" />
                  <span className="topbar-officer-name">{authenticatedUser}</span>

                </div>

                {/* Machined Metal Keycaps Group */}
                <div className="topbar-keycaps-group">

                  <NavLink to="/alerts" className="topbar-metal-keycap topbar-bell-keycap" title="Notifications">
                    <Bell size={15} />
                    {activeAlerts.length > 0 && (
                      <span className="topbar-keycap-badge">{activeAlerts.length}</span>
                    )}
                  </NavLink>

                  {/* Red Emergency Lock Keycap */}
                  <button 
                    className="topbar-metal-keycap topbar-lock-keycap" 
                    onClick={handleLockGCS}
                    title="Lock GCS Console & Return to Biometric Login Screen"
                  >
                   <LogOut size={13} />
                    <span>LOGOUT</span>
                  </button>
                </div>
              </div>
            </header>
          </div>

          {/* Router Content Container */}
          <main className="page-container">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard telemetryData={latestData} history={telemetryHistory} />} />
              <Route path="/digital-twin" element={<DigitalTwin telemetryData={latestData} />} />
              <Route path="/what-if" element={<WhatIfSimulator />} />
              <Route path="/fleet" element={<Fleet telemetryData={latestData} />} />
              <Route path="/analytics" element={<Analytics history={telemetryHistory} />} />
              <Route path="/fault-detection" element={<FaultDetection telemetryData={latestData} onInjectFault={injectFault} currentFault={currentFault} />} />
              <Route path="/rul" element={<RULPrediction telemetryData={latestData} />} />
              <Route path="/alerts" element={<Alerts telemetryData={latestData} />} />
              <Route path="/mission-replay" element={<MissionReplay telemetryData={latestData} history={telemetryHistory} />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
