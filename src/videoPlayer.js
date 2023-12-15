import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const bufferRef = useRef(null);
  const [hls, setHls] = useState(null);
  const [inputUrl, setInputUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const [bufferedDurations, setBufferedDurations] = useState([]);
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  useEffect(() => {
    const video = videoRef.current;

    const initializeHls = () => {
      const newHls = new Hls();
      setHls(newHls);

      newHls.loadSource(currentUrl);
      newHls.attachMedia(video);

      newHls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Handle MANIFEST_PARSED event
      });

      newHls.on(Hls.Events.FRAG_BUFFERED, () => {
        updateBufferBar();
      });

      newHls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS error:', data);
      });
    };

    if (Hls.isSupported()) {
      initializeHls();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentUrl;
      video.addEventListener('loadedmetadata', () => {
        // Handle loadedmetadata event
      });
      video.addEventListener('progress', () => {
        updateBufferBar();
      });
    }
  }, [currentUrl]);

  const updateBufferBar = () => {
    const video = videoRef.current;

    if (video) {
      const buffered = video.buffered;
      const currentDuration = video.duration;

      const intervals = 4; // Number of intervals
      const intervalDuration = currentDuration / (intervals - 1);

      const newBufferedDurations = [];
      for (let i = 0; i < intervals; i++) {
        const intervalTime = i * intervalDuration;
        newBufferedDurations.push(intervalTime);
      }

      setTotalDuration(currentDuration);
      setBufferedDurations(newBufferedDurations);
    }
  };

  const handlePlay = () => {
    videoRef.current.play();
  };

  const handlePause = () => {
    videoRef.current.pause();
  };

  const handleStop = () => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  const handleSeekTo = (time) => {
    videoRef.current.currentTime = time;
  };

  const handlePlaybackSpeedChange = (speed) => {
    videoRef.current.playbackRate = speed;
    setSelectedSpeed(speed);
  };

  const handleDownload = () => {
    // Implement video download logic
  };

  const handleUrlChange = (e) => {
    setInputUrl(e.target.value);
  };

  const handleLoadUrl = () => {
    setCurrentUrl(inputUrl);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <input type="text" value={inputUrl} onChange={handleUrlChange} />
      <button onClick={handleLoadUrl}>Load URL</button>
      <video ref={videoRef} controls style={{ width: '100%' }}>
        <div ref={bufferRef} style={{ position: 'relative', height: '10px', width: '100%', background: 'lightgray' }}>
          {bufferedDurations.map((duration, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${(duration / totalDuration) * 100}%`,
                height: '100%',
                borderLeft: '2px solid black',
              }}
            />
          ))}
        </div>
      </video>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={() => handleSeekTo(30)}>Seek to 30s</button>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={selectedSpeed}
        onChange={(e) => handlePlaybackSpeedChange(e.target.value)}
      />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
};

export default VideoPlayer;
