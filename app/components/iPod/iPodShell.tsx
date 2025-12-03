"use client";

import { ReactNode, useCallback, useEffect } from "react";
import ClickWheel from "./ClickWheel";
import Screen from "./Screen";
import { useIPodStore } from "../../store/iPodStore";
import { getPhotosByAlbum } from "../../data/mockData";

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
  } = useIPodStore();

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

  const handleScroll = useCallback(
    (direction: "up" | "down") => {
      const { screenType, data } = currentScreen;

      // If scrubbing, use wheel to scrub through song
      if (isScrubbing && currentSong) {
        const delta = direction === "down" ? 5 : -5; // 5 seconds per scroll
        scrub(delta);
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

  // If sleeping, show sleep screen
  if (isSleeping) {
    return (
      <div className="ipod-container">
        <div className="ipod-shell">
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
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ipod-container">
      <div className="ipod-shell">
        <div className="ipod-top-section">
          <Screen>{children}</Screen>
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
          />
        </div>
      </div>
    </div>
  );
}
