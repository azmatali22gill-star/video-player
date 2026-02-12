
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VideoDetails() {
  const { videos = [], currentTime = {} } = useLocation().state || {};
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Playback Summary (Total: {videos.length})</h2>
      {videos.map((url, i) => (
        <div key={i} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
          <p>
            <strong>Video {i + 1}:</strong> {url}
          </p>
          <p>
            <strong>Time Tracked:</strong> {currentTime[i] || 0} ms
          </p>
        </div>
      ))}
    </div>
  );
}

export default VideoDetails;
