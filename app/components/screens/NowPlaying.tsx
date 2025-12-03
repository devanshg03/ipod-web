"use client";

import { useEffect } from "react";
import { useIPodStore } from "../../store/iPodStore";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function NowPlaying() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    setCurrentTime,
    nextTrack,
    queueIndex,
    queue,
    isScrubbing,
  } = useIPodStore();

  // Simulate playback timer (only when not scrubbing)
  useEffect(() => {
    if (!isPlaying || !currentSong || isScrubbing) return;

    const interval = setInterval(() => {
      setCurrentTime(currentTime + 1);

      if (currentTime >= currentSong.duration) {
        nextTrack();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    currentSong,
    currentTime,
    setCurrentTime,
    nextTrack,
    isScrubbing,
  ]);

  if (!currentSong) {
    return (
      <div className="np-ipod empty">
        <p>No song selected</p>
      </div>
    );
  }

  const progress = (currentTime / currentSong.duration) * 100;

  return (
    <div className="np-ipod">
      {/* Position indicator */}
      <div className="np-position">
        {queueIndex + 1} of {queue.length}
      </div>

      {/* Main content: artwork + track info */}
      <div className="np-content">
        {/* Album artwork */}
        <div
          className="np-artwork"
          style={{ background: currentSong.albumArt }}
        />

        {/* Track details */}
        <div className="np-details">
          <div className="np-title">{currentSong.title}</div>
          <div className="np-artist">{currentSong.artist}</div>
          <div className="np-album">{currentSong.album}</div>
        </div>
      </div>

      {/* Progress scrubber */}
      <div className="np-progress">
        <div className="np-bar">
          <div className="np-bar-fill" style={{ width: `${progress}%` }} />
          <div className="np-diamond" style={{ left: `${progress}%` }} />
        </div>
        <div className="np-times">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(currentSong.duration - currentTime)}</span>
        </div>
      </div>
    </div>
  );
}
