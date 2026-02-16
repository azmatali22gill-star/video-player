import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js"; 

function VideoPlayer({ url, isActive, index, total }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null); 
  const [loadTime, setLoadTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [metrics, setMetrics] = useState({ res: "Detecting...", dur: 0 });
  const startTime = useRef(null);

  useEffect(() => {
    
    setLoadTime(0);
    setMetrics({ res: "Detecting...", dur: 0 });
    startTime.current = performance.now();

    const video = videoRef.current;
    if (!video) return;

    if (url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isActive) video.play().catch(() => {});
        });
      } 
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    } else {
      video.src = url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url]);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleMetadata = (e) => {
    const video = e.target;
    setMetrics({
      res: `${video.videoWidth}x${video.videoHeight}`,
      dur: (video.duration * 1000).toFixed(0)
    });
  };

  const handleCanPlay = () => {
    if (startTime.current && loadTime === 0) {
      const duration = Math.round(performance.now() - startTime.current);
      setLoadTime(duration);
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        onLoadedMetadata={handleMetadata}
        onCanPlay={handleCanPlay}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      
      <div style={{
        position: "absolute", top: 20, left: 20, 
        background: "rgba(0,0,0,0.7)", color: "white", 
        padding: "10px", borderRadius: "8px", zIndex: 10,
        pointerEvents: "none"
      }}>
        Video: {index + 1} / {total} <br/>
        <span style={{ color: "#4aff4a" }}>
          {loadTime > 0 ? `Load: ${loadTime} ms` : "Buffering..."}
        </span>
      </div>

      {/* Details Button */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 20 }}>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: "#007bff", color: "white", border: "none",
            padding: "8px 12px", borderRadius: "5px", cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {showDetails ? "✖ Close" : "ℹ Video Details"}
        </button>

        {showDetails && (
          <div style={{
            marginTop: "10px", background: "rgba(0,0,0,0.9)",
            color: "white", padding: "15px", borderRadius: "8px",
            width: "200px", fontSize: "13px"
          }}>
            <p><strong>Type:</strong> {url.includes(".m3u8") ? "HLS (Adaptive)" : "MP4"}</p>
            <p><strong>Resolution:</strong> {metrics.res}</p>
            <p><strong>Load Delay:</strong> {loadTime} ms</p>
            <p style={{wordBreak: "break-all", fontSize: "10px", color: "#aaa"}}>
              <strong>URL:</strong> {url}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;