import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function InputPage() {
  const [urls, setUrls] = useState("");
  const [loadCount, setLoadCount] = useState(5);
  const navigate = useNavigate();

  const handlePlay = () => {
    const videoList = urls
      .split(/\n|,/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (videoList.length === 0) {
      alert("Enter at least 1 URL");
      return;
    }

    if (loadCount < 1) {
      alert("Load count must be at least 1");
      return;
    }

    navigate("/reel", {
      state: {
        videos: videoList,
        loadCount: Number(loadCount),
      },
    });
  };

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h2>Video url Box</h2>

      <textarea
        rows={8}
        placeholder="Enter video URLs (one per line)"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        style={{ width: "90%", maxWidth: 600 }}
      />

      <div style={{ marginTop: 20 }}>
        <label>Videos to Load at a Time: </label>
        <input
          type="number"
          min="1"
          value={loadCount}
          onChange={(e) => setLoadCount(Number(e.target.value))}
          style={{ width: 60 }}
        />
      </div>

      <button
        onClick={handlePlay}
        style={{ marginTop: 20, padding: "10px 30px" }}
      >
        Play
      </button>
    </div>
  );
}

export default InputPage;
