"use client";

import { useIPodStore } from "../../store/iPodStore";

interface StatusBarProps {
  title: string;
}

export default function StatusBar({ title }: StatusBarProps) {
  const { isPlaying, currentSong, settings, isHoldOn } = useIPodStore();

  return (
    <div className="status-bar">
      <div className="status-left">
        {/* Hold lock icon - simple padlock like original iPod */}
        {isHoldOn && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="status-icon lock-icon"
          >
            <path d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9V7z" />
          </svg>
        )}
        {/* Play indicator */}
        {isPlaying && currentSong && !isHoldOn && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="status-icon play-icon"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        {/* Pause indicator */}
        {!isPlaying && currentSong && !isHoldOn && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="status-icon pause-icon"
          >
            <path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z" />
          </svg>
        )}
      </div>

      <div className="status-title">{title}</div>

      <div className="status-right">
        {/* Shuffle icon */}
        {settings.shuffle !== "off" && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="status-icon shuffle-icon"
          >
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
        )}
        {/* Repeat icon */}
        {settings.repeat !== "off" && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="status-icon repeat-icon"
          >
            {settings.repeat === "one" ? (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
            ) : (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            )}
          </svg>
        )}
        {/* Battery */}
        <div className="battery">
          <div className="battery-body">
            <div className="battery-level" style={{ width: "80%" }} />
          </div>
          <div className="battery-cap" />
        </div>
      </div>
    </div>
  );
}
