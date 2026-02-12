import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";

export default function VideoReel() {
  const location = useLocation();
  const allVideos = useMemo(() => location.state?.videos || [], [location.state]);
  const userLoadCount = location.state?.loadCount || 6;

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isAdjusting = useRef(false);

  useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      // Sirf tab update karein jab hum jump NA kar rahe hon
      if (isAdjusting.current) return; 

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const index = parseInt(entry.target.getAttribute("data-index"));
          setCurrentIndex(index);
        }
      });
    },
    { threshold: [0.6] } 
  );

  const elements = document.querySelectorAll(".v-container");
  elements.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, [allVideos]); // currentIndex ko yahan dependency mein mat dalna

  const handleScroll = (e) => {
  const container = e.target;
  if (isAdjusting.current) return;

  const { scrollTop, scrollHeight, clientHeight } = container;
  const threshold = 5; 

  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    // Jab last se first par jayen: Index 0 set karein
    jumpTo(threshold, 0); 
  } else if (scrollTop <= 0) {
    // Jab first se last par jayen: Aakhri Index set karein
    jumpTo(scrollHeight - clientHeight - threshold, allVideos.length - 1);
  }
};

const jumpTo = (targetPosition, manualIndex) => {
  isAdjusting.current = true;
  const container = containerRef.current;

  // 1. Snap aur Observer ka masla khatam karne ke liye index foran update karein
  setCurrentIndex(manualIndex);
  
  container.style.scrollSnapType = "none";
  container.style.scrollBehavior = "auto";

  // 2. Jump karein
  container.scrollTop = targetPosition;

  // 3. Double frame check taake jump confirm ho jaye
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.scrollSnapType = "y mandatory";
      
      // Thora sa extra time taake purani scroll velocity khatam ho jaye
      setTimeout(() => {
        isAdjusting.current = false;
      }, 150); 
    });
  });
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
        scrollBehavior: "auto", // Isko 'auto' hi rehne den reset ke liye
        WebkitOverflowScrolling: "touch" // For smooth iOS scroll
      }}
    >
      {allVideos.map((url, i) => {
        const range = userLoadCount - 1; 
        const backBuffer = Math.floor(range / 2);
        const frontBuffer = Math.ceil(range / 2);

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
              <div style={{ background: "#000", width: "100%", height: "100%" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}