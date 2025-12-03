"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import ClickWheel from "./ClickWheel";
import Screen from "./Screen";
import { useIPodStore } from "../../store/iPodStore";
import { getPhotosByAlbum } from "../../data/mockData";
import { getAudioEngine } from "../../lib/audioEngine";

interface iPodShellProps {
  children: ReactNode;
  onSelect: () => void;
  itemCount: number;
}

export default function IPodShell({
  children,
  onSelect,
  itemCount,
}: iPodShellProps) {
  const {
    goBack,
    incrementSelectedIndex,
    decrementSelectedIndex,
    togglePlayPause,
    nextTrack,
    previousTrack,
    currentSong,
    currentScreen,
    currentPhotoIndex,
    setCurrentPhoto,
    isScrubbing,
    startScrubbing,
    stopScrubbing,
    scrub,
    isSleeping,
    sleep,
    wake,
    backlightOn,
    lastActivityTime,
    dimBacklight,
    settings,
    isHoldOn,
    toggleHold,
    showVolumeOverlay,
    adjustVolume,
    showVolume,
    isSeeking,
    startSeeking,
    stopSeeking,
    setCurrentTime,
  } = useIPodStore();

  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showHoldIndicator, setShowHoldIndicator] = useState(false);
  const prevHoldRef = useRef(isHoldOn);

  // Show hold indicator briefly when hold state changes
  useEffect(() => {
    if (isHoldOn !== prevHoldRef.current) {
      prevHoldRef.current = isHoldOn;
      if (isHoldOn) {
        setShowHoldIndicator(true);
        const timer = setTimeout(() => {
          setShowHoldIndicator(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isHoldOn]);

  // Backlight timer effect
  useEffect(() => {
    if (isSleeping || settings.backlightTimer === 0) return;

    const checkBacklight = () => {
      const elapsed = (Date.now() - lastActivityTime) / 1000;
      if (elapsed >= settings.backlightTimer && backlightOn) {
        dimBacklight();
      }
    };

    const interval = setInterval(checkBacklight, 1000);
    return () => clearInterval(interval);
  }, [
    isSleeping,
    settings.backlightTimer,
    lastActivityTime,
    backlightOn,
    dimBacklight,
  ]);

  // Seeking effect (when holding forward/back buttons)
  useEffect(() => {
    if (isSeeking && currentSong) {
      const seekRate = 4; // seconds per tick
      const tickRate = 200; // ms between ticks

      seekIntervalRef.current = setInterval(() => {
        const store = useIPodStore.getState();
        const delta = store.seekDirection === "forward" ? seekRate : -seekRate;
        const newTime = Math.max(
          0,
          Math.min(currentSong.duration, store.currentTime + delta)
        );
        setCurrentTime(newTime);

        // Also seek in audio engine for user songs
        if (currentSong.isUserSong) {
          const audioEngine = getAudioEngine();
          audioEngine.seek(newTime);
        }
      }, tickRate);

      return () => {
        if (seekIntervalRef.current) {
          clearInterval(seekIntervalRef.current);
        }
      };
    }
  }, [isSeeking, currentSong, setCurrentTime]);

  const handleScroll = useCallback(
    (direction: "up" | "down") => {
      const { screenType, data } = currentScreen;

      // If scrubbing, use wheel to scrub through song
      if (isScrubbing && currentSong) {
        const delta = direction === "down" ? 5 : -5; // 5 seconds per scroll
        scrub(delta);
        return;
      }

      // Handle volume adjustment on Now Playing screen
      if (screenType === "nowPlaying" && currentSong) {
        const delta = direction === "down" ? 5 : -5;
        adjustVolume(delta);
        showVolume();
        return;
      }

      // Handle photo viewer scrolling
      if (screenType === "photoViewer") {
        const photoData = data as { albumId: string };
        const albumId = photoData?.albumId || "pa1";
        const photos = getPhotosByAlbum(albumId);
        const maxIndex = photos.length - 1;

        if (direction === "down") {
          const newIndex = Math.min(currentPhotoIndex + 1, maxIndex);
          setCurrentPhoto(albumId, newIndex);
        } else {
          const newIndex = Math.max(currentPhotoIndex - 1, 0);
          setCurrentPhoto(albumId, newIndex);
        }
        return;
      }

      // Normal menu scrolling
      if (direction === "up") {
        decrementSelectedIndex();
      } else {
        incrementSelectedIndex(itemCount);
      }
    },
    [
      currentScreen,
      currentPhotoIndex,
      setCurrentPhoto,
      incrementSelectedIndex,
      decrementSelectedIndex,
      itemCount,
      isScrubbing,
      currentSong,
      scrub,
      adjustVolume,
      showVolume,
    ]
  );

  const handleMenu = useCallback(() => {
    if (isScrubbing) {
      stopScrubbing();
      return;
    }
    goBack();
  }, [goBack, isScrubbing, stopScrubbing]);

  const handleSelect = useCallback(() => {
    // Handle stopwatch/timer select
    if (
      currentScreen.screenType === "stopwatch" ||
      currentScreen.screenType === "timer"
    ) {
      const clockSelect = (window as unknown as { clockSelect?: () => void })
        .clockSelect;
      if (clockSelect) {
        clockSelect();
        return;
      }
    }

    if (isScrubbing) {
      stopScrubbing();
      return;
    }

    onSelect();
  }, [onSelect, currentScreen, isScrubbing, stopScrubbing]);

  const handleSelectLongPress = useCallback(() => {
    // Start scrubbing when in Now Playing screen
    if (currentScreen.screenType === "nowPlaying" && currentSong) {
      startScrubbing();
    }
  }, [currentScreen, currentSong, startScrubbing]);

  const handlePlayPause = useCallback(() => {
    // Handle stopwatch/timer play/pause
    if (
      currentScreen.screenType === "stopwatch" ||
      currentScreen.screenType === "timer"
    ) {
      const clockPlayPause = (
        window as unknown as { clockPlayPause?: () => void }
      ).clockPlayPause;
      if (clockPlayPause) {
        clockPlayPause();
        return;
      }
    }

    if (currentSong) {
      togglePlayPause();
    }
  }, [togglePlayPause, currentSong, currentScreen]);

  const handlePlayPauseLongPress = useCallback(() => {
    sleep();
  }, [sleep]);

  const handleNext = useCallback(() => {
    const { screenType, data } = currentScreen;

    if (screenType === "photoViewer") {
      const photoData = data as { albumId: string };
      const albumId = photoData?.albumId || "pa1";
      const photos = getPhotosByAlbum(albumId);
      const maxIndex = photos.length - 1;
      const newIndex = Math.min(currentPhotoIndex + 1, maxIndex);
      setCurrentPhoto(albumId, newIndex);
      return;
    }

    if (currentSong) {
      nextTrack();
    }
  }, [
    currentScreen,
    currentPhotoIndex,
    setCurrentPhoto,
    nextTrack,
    currentSong,
  ]);

  const handlePrevious = useCallback(() => {
    const { screenType, data } = currentScreen;

    if (screenType === "photoViewer") {
      const photoData = data as { albumId: string };
      const albumId = photoData?.albumId || "pa1";
      const newIndex = Math.max(currentPhotoIndex - 1, 0);
      setCurrentPhoto(albumId, newIndex);
      return;
    }

    if (currentSong) {
      previousTrack();
    }
  }, [
    currentScreen,
    currentPhotoIndex,
    setCurrentPhoto,
    previousTrack,
    currentSong,
  ]);

  // Handle wake on any button press when sleeping
  const handleWakePress = useCallback(() => {
    if (isSleeping) {
      wake();
    }
  }, [isSleeping, wake]);

  // Long press handlers for seeking
  const handleNextLongPress = useCallback(() => {
    if (currentSong) {
      startSeeking("forward");
    }
  }, [currentSong, startSeeking]);

  const handlePreviousLongPress = useCallback(() => {
    if (currentSong) {
      startSeeking("backward");
    }
  }, [currentSong, startSeeking]);

  const handleSeekRelease = useCallback(() => {
    if (isSeeking) {
      stopSeeking();
    }
  }, [isSeeking, stopSeeking]);

  // If sleeping, show sleep screen
  if (isSleeping) {
    return (
      <div className="ipod-container">
        <div className="ipod-shell">
          {/* Hold switch - on top edge */}
          <div
            className={`hold-switch ${isHoldOn ? "on" : ""}`}
            onClick={toggleHold}
            title={isHoldOn ? "Hold: ON" : "Hold: OFF"}
          >
            <div className="hold-switch-track">
              <div className="hold-switch-knob" />
              {isHoldOn && <div className="hold-switch-orange" />}
            </div>
          </div>

          <div className="ipod-top-section">
            <div className="ipod-screen sleep">
              <div className="sleep-screen" onClick={handleWakePress}>
                <div className="sleep-hint">Press any button to wake</div>
              </div>
            </div>
          </div>

          <div className="ipod-bottom-section">
            <ClickWheel
              onScroll={() => wake()}
              onSelect={wake}
              onSelectLongPress={wake}
              onMenu={wake}
              onPlayPause={wake}
              onPlayPauseLongPress={wake}
              onNext={wake}
              onPrevious={wake}
              onNextLongPress={wake}
              onPreviousLongPress={wake}
              onSeekRelease={() => {}}
              disabled={isHoldOn}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ipod-container">
      <div className="ipod-shell">
        {/* Hold switch - on top edge */}
        <div
          className={`hold-switch ${isHoldOn ? "on" : ""}`}
          onClick={toggleHold}
          title={isHoldOn ? "Hold: ON - Controls locked" : "Hold: OFF"}
        >
          <div className="hold-switch-track">
            <div className="hold-switch-knob" />
            {isHoldOn && <div className="hold-switch-orange" />}
          </div>
        </div>

        <div className="ipod-top-section">
          <Screen>{children}</Screen>
          {/* Volume overlay */}
          {showVolumeOverlay && (
            <div className="volume-overlay">
              <div className="volume-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </div>
              <div className="volume-bar-container">
                <div className="volume-bar">
                  <div
                    className="volume-bar-fill"
                    style={{ width: `${settings.volume}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          {/* Hold indicator overlay - shows briefly when hold is toggled on */}
          {showHoldIndicator && (
            <div className="hold-indicator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="ipod-bottom-section">
          <ClickWheel
            onScroll={handleScroll}
            onSelect={handleSelect}
            onSelectLongPress={handleSelectLongPress}
            onMenu={handleMenu}
            onPlayPause={handlePlayPause}
            onPlayPauseLongPress={handlePlayPauseLongPress}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNextLongPress={handleNextLongPress}
            onPreviousLongPress={handlePreviousLongPress}
            onSeekRelease={handleSeekRelease}
            disabled={isHoldOn}
          />
        </div>
      </div>
    </div>
  );
}
