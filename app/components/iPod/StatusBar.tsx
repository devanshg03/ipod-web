'use client';

import { useIPodStore } from '../../store/iPodStore';

interface StatusBarProps {
  title: string;
}

export default function StatusBar({ title }: StatusBarProps) {
  const { isPlaying, currentSong } = useIPodStore();
  
  return (
    <div className="status-bar">
      <div className="status-left">
        {isPlaying && currentSong && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="play-icon">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>
      
      <div className="status-title">{title}</div>
      
      <div className="status-right">
        <div className="battery">
          <div className="battery-body">
            <div className="battery-level" style={{ width: '80%' }} />
          </div>
          <div className="battery-cap" />
        </div>
      </div>
    </div>
  );
}

