"use client";

import { useEffect, useRef, useCallback } from "react";
import { useIPodStore } from "../../store/iPodStore";
import { getAudioEngine } from "../../lib/audioEngine";
import { musicDB } from "../../lib/musicDB";

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
    settings,
  } = useIPodStore();

  const audioLoadedRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const isUserSong = currentSong?.isUserSong ?? false;

  // Load audio when song changes (for user songs)
  useEffect(() => {
    if (!currentSong) return;

    // Only load audio for user songs
    if (isUserSong && audioLoadedRef.current !== currentSong.id) {
      isLoadingRef.current = true;
      const loadAudio = async () => {
        try {
          const blob = await musicDB.getAudioBlob(currentSong.id);
          if (blob) {
            const audioEngine = getAudioEngine();

            // Wait for audio to be ready before proceeding
            await audioEngine.loadBlob(blob);
            audioLoadedRef.current = currentSong.id;
            isLoadingRef.current = false;

            // Set volume from settings
            audioEngine.setVolume(settings.volume);

            // Auto-play if isPlaying is true (only after load completes)
            if (isPlaying) {
              audioEngine.play().catch((error) => {
                // Silently handle AbortError - it's expected when switching tracks quickly
                if (error.name !== "AbortError") {
                  console.error("Failed to play audio:", error);
                }
              });
            }
          } else {
            isLoadingRef.current = false;
          }
        } catch (error) {
          console.error("Failed to load audio:", error);
          isLoadingRef.current = false;
        }
      };

      loadAudio();
    } else if (!isUserSong) {
      // Reset for mock songs
      audioLoadedRef.current = null;
      isLoadingRef.current = false;
    }
  }, [currentSong, isUserSong, isPlaying, settings.volume]);

  // Handle play/pause for user songs (only when isPlaying changes, not during loading)
  useEffect(() => {
    if (!currentSong || !isUserSong) return;

    // Skip if we're currently loading or if song isn't loaded yet
    if (isLoadingRef.current || audioLoadedRef.current !== currentSong.id)
      return;

    const audioEngine = getAudioEngine();

    if (isPlaying) {
      audioEngine.play().catch((error) => {
        // Silently handle AbortError - it's expected when switching tracks quickly
        if (error.name !== "AbortError") {
          console.error("Failed to play audio:", error);
        }
      });
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentSong, isUserSong]);

  // Subscribe to audio engine events for user songs
  useEffect(() => {
    if (!currentSong || !isUserSong) return;

    const audioEngine = getAudioEngine();

    const handleTimeUpdate = (time: number) => {
      if (!isScrubbing) {
        setCurrentTime(Math.floor(time));
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    audioEngine.on("timeupdate", handleTimeUpdate);
    audioEngine.on("ended", handleEnded);

    return () => {
      audioEngine.off("timeupdate", handleTimeUpdate);
      audioEngine.off("ended", handleEnded);
    };
  }, [currentSong, isUserSong, isScrubbing, setCurrentTime, nextTrack]);

  // Handle scrubbing for user songs
  useEffect(() => {
    if (!currentSong || !isUserSong || !isScrubbing) return;

    const audioEngine = getAudioEngine();
    audioEngine.seek(currentTime);
  }, [currentTime, isScrubbing, currentSong, isUserSong]);

  // Sync volume changes to audio engine
  useEffect(() => {
    if (!currentSong || !isUserSong) return;

    const audioEngine = getAudioEngine();
    audioEngine.setVolume(settings.volume);
  }, [settings.volume, currentSong, isUserSong]);

  // Fallback: Simulate playback timer for mock songs (only when not scrubbing)
  useEffect(() => {
    // Only simulate for mock songs (non-user songs)
    if (!currentSong || isUserSong || !isPlaying || isScrubbing) return;

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
    isUserSong,
  ]);

  if (!currentSong) {
    return (
      <div className="np-ipod empty">
        <p>No song selected</p>
      </div>
    );
  }

  const progress =
    currentSong.duration > 0 ? (currentTime / currentSong.duration) * 100 : 0;

  // Check if albumArt is a data URL (image) or a gradient
  const isImageArt = currentSong.albumArt.startsWith("data:");
  const artworkStyle = isImageArt
    ? {
        backgroundImage: `url(${currentSong.albumArt})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#1a1a1a",
      }
    : { background: currentSong.albumArt };

  return (
    <div className="np-ipod">
      {/* Position indicator */}
      <div className="np-position">
        {queueIndex + 1} of {queue.length}
      </div>

      {/* Main content: artwork + track info */}
      <div className="np-content">
        {/* Album artwork */}
        <div className="np-artwork" style={artworkStyle} />

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
          <span>
            -{formatTime(Math.max(0, currentSong.duration - currentTime))}
          </span>
        </div>
      </div>
    </div>
  );
}
