import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import InputPage from "./component/InputPage";
import VideoReel from "./component/VideoReel";
import VideoDetails from "./component/VideoDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/reel" element={<VideoReel />} />
        <Route path="/details" element={<VideoDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
