import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const bufferRef = useRef(null);
  const [hls, setHls] = useState(null);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const [bufferedDurations, setBufferedDurations] = useState([]);
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (inputUrl.trim() !== '') {
      setCurrentUrl(inputUrl);
    }
  }, [inputUrl]);

  useEffect(() => {
    if (inputTime?.length >= 5) {
      handleSeekTo(inputTime);
    }
  }, [inputTime]);

  useEffect(() => {
    const video = videoRef.current;

    const initializeHls = () => {
      const newHls = new Hls();
      setHls(newHls);

      newHls.loadSource(currentUrl);
      newHls.attachMedia(video);

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
      video.addEventListener('progress', () => {
        updateBufferBar();
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [currentUrl]);

  const updateBufferBar = () => {
    const video = videoRef.current;

    if (video) {
      const currentDuration = video.duration;

      const intervals = 4;
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

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
  };

  const handlePlayPause = () => {
    const video = videoRef.current;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    }

    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const parseTimeToSeconds = (formattedTime) => {
    if (!formattedTime || formattedTime?.length < 5) {
      return 0;
    } else {
      const timeArray = formattedTime?.split(':');

      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      if (timeArray.length === 3) {
        // Case: HH:MM:SS
        hours = parseInt(timeArray[0]) || 0;
        minutes = parseInt(timeArray[1]) || 0;
        seconds = parseInt(timeArray[2]) || 0;
      } else if (timeArray.length === 2) {
        // Case: MM:SS
        minutes = parseInt(timeArray[0]) || 0;
        seconds = parseInt(timeArray[1]) || 0;
      }

      return hours * 3600 + minutes * 60 + seconds;
    }
  };

  const handleStop = () => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  const handleSeekTo = (inputTime) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = parseTimeToSeconds(inputTime);
    }
  };

  const handlePlaybackSpeedChange = (speed) => {
    videoRef.current.playbackRate = speed;
    setSelectedSpeed(speed);
  };

  const handleDownload = async () => {
    try {
      const videoBlob = await fetch(currentUrl).then((response) => response.blob());

      const a = document.createElement('a');
      const url = window.URL.createObjectURL(videoBlob);
      a.href = url;
      a.download = 'downloaded-video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  const handleUrlChange = (e) => {
    setInputUrl(e.target.value);
  };
  const handleTime = (e) => {
    setInputTime(e.target.value);
  };

  const handleProgressBarClick = (e) => {
    const progressBar = bufferRef.current;
    const video = videoRef.current;

    const boundingRect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - boundingRect.left;
    const progressBarWidth = boundingRect.width;
    const seekTime = (clickX / progressBarWidth) * totalDuration;

    video.currentTime = seekTime;
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        isPlaying
        onError={(err) => console.log(err, 'hls video error')}
        style={{ width: '100%' ,backgroundColor:'cornflowerblue'}}
      ></video>
      <div
        style={{ position: 'relative', marginTop: '-10px' }}
        onClick={handleProgressBarClick}
      >
        <progress
          ref={bufferRef}
          style={{ color: 'blue', width: '100%' }}
          id="progress"
          max="100"
          value={(videoRef?.current?.currentTime / totalDuration) * 100}
        ></progress>

        {bufferedDurations.map((duration, index) => {
          const percent = (duration / totalDuration) * 100;

          return (
            <React.Fragment key={index}>
              <div
                className="buffered-region"
                style={{
                  left: `${percent}%`,
                  color: 'blue',
                  position: 'absolute',
                  height: '100%',
                  borderColor: 'turquoise',
                  marginTop: '-15px',
                }}
              ></div>
              <div
                className="buffered-region"
                style={{
                  left: `${percent - 3}%`,
                  color: 'blue',
                  position: 'absolute',
                  height: '100%',
                  borderColor: 'white',
                }}
              >
                {parseInt(duration / 60) +
                  ':' +
                  (parseInt(duration - parseInt(duration / 60) * 60) > 9
                    ? parseInt(duration - parseInt(duration / 60) * 60)
                    : '0' + parseInt(duration - parseInt(duration / 60) * 60))}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div
        id="grid-container"
        className="grid-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          gap: '10px',
          alignItems: 'center',
          padding: '5px',
        }}
      >
        <img
          style={{ height: '60px' }}
          className="controlsIcon"
          onClick={handlePlayPause}
          alt=""
          src="/button.png"
        />
        <button onClick={handleStop}>Stop</button>
        <label htmlFor="copy-dropdown">Current Time: </label>
        <input
          type="text"
          style={{ height: '20px', width: '50px' }}
          value={formatTime(videoRef?.current?.currentTime)}
          onChange={handleTime}
        />
        <label htmlFor="copy-dropdown">URL: </label>
        <input
          placeholder="Input Url"
          style={{ height: '20px' }}
          type="text"
          value={inputUrl}
          onChange={handleUrlChange}
        />
        <label htmlFor="copy-dropdown">Play Speed: </label>
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
    </div>
  );
};

export default VideoPlayer;
