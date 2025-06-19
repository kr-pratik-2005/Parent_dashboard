import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Maximize, Minimize, Play, Pause } from "lucide-react";
import ClassroomImg from "../assets/Classroom.jpg"; // fallback image
import BottomNav from '../components/BottomNav';
import { Link } from "react-router-dom";
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
const headerIconStyle = {
  width: 24,
  height: 24,
  cursor: "pointer",
  color: "#666",
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

export default function CCTV() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Play/Pause handler
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Fullscreen handler
  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  // Update time
  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  // Initialize video duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateDuration = () => setDuration(video.duration);
    video.addEventListener('loadedmetadata', updateDuration);
    return () => video.removeEventListener('loadedmetadata', updateDuration);
  }, []);

  // Progress bar width
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "#f2f2f2",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: "18px 0 10px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
      }}>
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
        }}>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              color: "#444",
              cursor: "pointer",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            ←
          </button>
          <div style={{
            fontWeight: 600,
            fontSize: 16,
            color: "#333",
            flex: 1,
            textAlign: "center",
          }}>
            CCTV Screen
          </div>
                 <span
            style={headerIconStyle}
            onClick={() => alert("Notifications")}
            aria-label="Notifications"
            role="button"
          >
            <Bell size={22} color="#666" />
          </span>
        </div>
      </div>

      {/* Welcome Row */}
      <div style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 18,
        marginBottom: 10,
        padding: "0 18px",
      }}>
        <span style={{ fontWeight: 600, fontSize: 18, color: "#222" }}>
          Hey Hema, <br />
          Welcome!
        </span>
        <div style={{
          background: "#e5e5e5",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 13,
          color: "#444",
          textAlign: "center",
          minWidth: 80,
        }}>
          <div>Today</div>
<div style={{ fontWeight: 500 }}>
  {new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })}
</div>

        </div>
      </div>

      {/* Class Tabs */}
      <div style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        gap: 8,
        padding: "0 18px",
        marginBottom: 18,
        overflowX: "auto",
      }}>
        <button style={{
          background: "#bdbdbd",
          borderRadius: 8,
          padding: "8px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          border: "none",
          cursor: "pointer",
          minWidth: 100,
          textAlign: "center",
        }}>
          Class Room
        </button>
        <button style={{
          background: "#bdbdbd",
          borderRadius: 8,
          padding: "8px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          border: "none",
          cursor: "pointer",
          minWidth: 100,
          textAlign: "center",
        }}>
          Class Room
        </button>
        <button style={{
          background: "#bdbdbd",
          borderRadius: 8,
          padding: "8px 18px",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          border: "none",
          cursor: "pointer",
          minWidth: 100,
          textAlign: "center",
        }}>
          Class Room
        </button>
      </div>

      {/* CCTV Video Card */}
      <div style={{
        position: "relative",
        width: "90%",
        maxWidth: 340,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 16px rgba(60,60,60,0.08)",
        overflow: "hidden",
        margin: "0 auto",
        marginBottom: 24,
      }}>
        {/* Top left: Class Room + Live */}
        <div style={{
          position: "absolute",
          top: 14,
          left: 16,
          color: "#222",
          fontWeight: 600,
          fontSize: 15,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          Class Room
        <Link
  to="/live"
  style={{
    background: "#38d39f",
    color: "#fff",
    fontWeight: 500,
    fontSize: 12,
    borderRadius: 8,
    padding: "2px 8px",
    marginLeft: 8,
    textDecoration: "none"
  }}
>
  Live
</Link>
        </div>
        {/* Top right: Refresh */}
        <div style={{
          position: "absolute",
          top: 14,
          right: 16,
          zIndex: 2,
          cursor: "pointer",
          background: "rgba(0,0,0,0.18)",
          borderRadius: "50%",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4.05 11A8 8 0 1 1 12 20"></path>
            <path d="M4 4v7h7"></path>
          </svg>
        </div>
        {/* Video */}
       <video
  ref={videoRef}
  style={{
    width: "100%",
    display: "block",
    borderRadius: 16,
  }}
  poster={ClassroomImg}
  onTimeUpdate={handleTimeUpdate}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
>
  {/* Replace with your actual video source */}
  <source src="/videos/classroom.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

{/* Video controls with timers at ends */}
<div
  style={{
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "0 16px 10px 16px",
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    fontSize: 13,
    zIndex: 3,
    background: "linear-gradient(transparent,rgba(0,0,0,0.35) 90%)"
  }}
>
  {/* Current Time */}
  <span style={{ minWidth: 40, textAlign: "left", color: "#fff" }}>
    {formatTime(currentTime)}
  </span>

  {/* Progress Bar */}
  <div
    style={{
      flex: 1,
      height: 4,
      background: "rgba(255,255,255,0.3)",
      borderRadius: 2,
      margin: "0 10px",
      position: "relative",
      overflow: "hidden"
    }}
  >
    <div
      style={{
        width: `${progress}%`,
        height: "100%",
        background: "#fff",
        borderRadius: 2,
        position: "absolute",
        left: 0,
        top: 0
      }}
    />
  </div>

  {/* Duration */}
  <span style={{ minWidth: 40, textAlign: "right", color: "#fff" }}>
    {formatTime(duration)}
  </span>

  {/* Play/Pause */}
  <button
    onClick={handlePlayPause}
    style={{
      background: "none",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      padding: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10
    }}
  >
    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
  </button>

  {/* Fullscreen */}
  <button
    onClick={handleFullscreen}
    style={{
      background: "none",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      padding: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
  </button>
</div>

      </div>
      <BottomNav />
    </div>
  );
}
