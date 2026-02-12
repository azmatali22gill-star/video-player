import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";

export default function VideoReel() {
  const location = useLocation();
  
  // 1. Data Setup
  const allVideos = useMemo(() => location.state?.videos || [], [location.state]);
  const userLoadCount = location.state?.loadCount || 6; // User jo bhi number de

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isAdjusting = useRef(false);

  // 2. Intersection Observer: Center video detect karne ke liye
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAdjusting.current) {
            const index = parseInt(entry.target.getAttribute("data-index"));
            setCurrentIndex(index);
          }
        });
      },
      { threshold: 0.7 } // Jab 70% video screen par ho
    );

    document.querySelectorAll(".v-container").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [allVideos]);

  // 3. Infinite Loop Reset Logic
  const handleScroll = (e) => {
    if (isAdjusting.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const threshold = 5; 

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      isAdjusting.current = true;
      e.target.style.scrollSnapType = "none";
      e.target.scrollTop = 5; 
      setTimeout(() => {
        e.target.style.scrollSnapType = "y mandatory";
        isAdjusting.current = false;
      }, 30);
    } else if (scrollTop <= 0) {
      isAdjusting.current = true;
      e.target.style.scrollSnapType = "none";
      e.target.scrollTop = scrollHeight - clientHeight - 5;
      setTimeout(() => {
        e.target.style.scrollSnapType = "y mandatory";
        isAdjusting.current = false;
      }, 30);
    }
  };

  if (allVideos.length === 0) return <div>No Videos</div>;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        background: "black",
        scrollbarWidth: "none",
        scrollBehavior: "auto" 
      }}
    >
      {allVideos.map((url, i) => {
        // --- EXACT CENTER-BALANCED LOGIC ---
        const range = userLoadCount - 1; 
        const backBuffer = Math.floor(range / 2); // Pichli videos ka quota
        const frontBuffer = Math.ceil(range / 2);  // Agli videos ka quota

        // Range checks (including Loop/Circular logic)
        const isWithinRange = (i >= currentIndex - backBuffer && i <= currentIndex + frontBuffer);
        const isCircularBack = (currentIndex - backBuffer < 0) && (i >= allVideos.length + (currentIndex - backBuffer));
        const isCircularFront = (currentIndex + frontBuffer >= allVideos.length) && (i < (currentIndex + frontBuffer) % allVideos.length);

        const shouldLoad = isWithinRange || isCircularBack || isCircularFront;

        return (
          <div
            key={i}
            className="v-container"
            data-index={i}
            style={{
              height: "100vh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000"
            }}
          >
            {shouldLoad ? (
              <VideoPlayer
                url={url}
                isActive={i === currentIndex}
                index={i}
                total={allVideos.length}
              />
            ) : (
              <div style={{ background: "#111", width: "100%", height: "100%" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}