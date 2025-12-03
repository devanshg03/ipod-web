"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useIPodStore } from "../../store/iPodStore";

interface ClickWheelProps {
  onScroll: (direction: "up" | "down") => void;
  onSelect: () => void;
  onSelectLongPress: () => void;
  onMenu: () => void;
  onPlayPause: () => void;
  onPlayPauseLongPress: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onNextLongPress?: () => void;
  onPreviousLongPress?: () => void;
  onSeekRelease?: () => void;
  disabled?: boolean;
}

export default function ClickWheel({
  onScroll,
  onSelect,
  onSelectLongPress,
  onMenu,
  onPlayPause,
  onPlayPauseLongPress,
  onNext,
  onPrevious,
  onNextLongPress,
  onPreviousLongPress,
  onSeekRelease,
  disabled = false,
}: ClickWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const { settings, isScrubbing, resetBacklight, isHoldOn } = useIPodStore();

  // Long press handling
  const [centerPressTimer, setCenterPressTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [playPressTimer, setPlayPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [nextPressTimer, setNextPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [prevPressTimer, setPrevPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isCenterLongPress, setIsCenterLongPress] = useState(false);
  const [isPlayLongPress, setIsPlayLongPress] = useState(false);
  const [isNextLongPress, setIsNextLongPress] = useState(false);
  const [isPrevLongPress, setIsPrevLongPress] = useState(false);

  const playClick = useCallback(() => {
    if (settings.clicker && !disabled) {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1200;
      oscillator.type = "square";
      gainNode.gain.value = 0.03;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.01);
    }
  }, [settings.clicker, disabled]);

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0;

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }, []);

  const handleWheelMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!wheelRef.current || disabled) return;

      resetBacklight();

      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
      );

      const outerRadius = rect.width / 2;
      const innerRadius = outerRadius * 0.35;

      if (distance < innerRadius || distance > outerRadius) {
        lastAngleRef.current = null;
        return;
      }

      const currentAngle = getAngle(clientX, clientY);

      if (lastAngleRef.current !== null) {
        let delta = currentAngle - lastAngleRef.current;

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        accumulatedRef.current += delta;

        const threshold = isScrubbing ? 8 : 15;

        if (Math.abs(accumulatedRef.current) >= threshold) {
          const direction = accumulatedRef.current > 0 ? "down" : "up";
          onScroll(direction);
          playClick();
          accumulatedRef.current = 0;
        }
      }

      lastAngleRef.current = currentAngle;
    },
    [getAngle, onScroll, playClick, disabled, isScrubbing, resetBacklight]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleWheelMove(e.clientX, e.clientY);
    },
    [handleWheelMove]
  );

  const handleMouseUp = useCallback(() => {
    lastAngleRef.current = null;
    accumulatedRef.current = 0;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      resetBacklight();
      handleWheelMove(e.clientX, e.clientY);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleWheelMove, handleMouseMove, handleMouseUp, disabled, resetBacklight]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleWheelMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleWheelMove]
  );

  const handleTouchEnd = useCallback(() => {
    lastAngleRef.current = null;
    accumulatedRef.current = 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      resetBacklight();
      if (e.touches.length > 0) {
        handleWheelMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleWheelMove, disabled, resetBacklight]
  );

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    wheel.addEventListener("touchmove", handleTouchMove, { passive: true });
    wheel.addEventListener("touchend", handleTouchEnd);

    return () => {
      wheel.removeEventListener("touchmove", handleTouchMove);
      wheel.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // Center button handlers (long press for scrubbing)
  const handleCenterMouseDown = useCallback(() => {
    if (disabled) return;
    resetBacklight();
    setIsCenterLongPress(false);
    const timer = setTimeout(() => {
      setIsCenterLongPress(true);
      onSelectLongPress();
    }, 500);
    setCenterPressTimer(timer);
  }, [disabled, onSelectLongPress, resetBacklight]);

  const handleCenterMouseUp = useCallback(() => {
    if (centerPressTimer) {
      clearTimeout(centerPressTimer);
      setCenterPressTimer(null);
    }
    if (!isCenterLongPress) {
      onSelect();
    }
    setIsCenterLongPress(false);
  }, [centerPressTimer, isCenterLongPress, onSelect]);

  // Play/Pause button handlers (long press for sleep)
  const handlePlayMouseDown = useCallback(() => {
    if (disabled) return;
    resetBacklight();
    setIsPlayLongPress(false);
    const timer = setTimeout(() => {
      setIsPlayLongPress(true);
      onPlayPauseLongPress();
    }, 1500); // Longer hold for sleep
    setPlayPressTimer(timer);
  }, [disabled, onPlayPauseLongPress, resetBacklight]);

  const handlePlayMouseUp = useCallback(() => {
    if (playPressTimer) {
      clearTimeout(playPressTimer);
      setPlayPressTimer(null);
    }
    if (!isPlayLongPress) {
      onPlayPause();
    }
    setIsPlayLongPress(false);
  }, [playPressTimer, isPlayLongPress, onPlayPause]);

  // Next button handlers (long press for seeking forward)
  const handleNextMouseDown = useCallback(() => {
    if (disabled) return;
    resetBacklight();
    setIsNextLongPress(false);
    const timer = setTimeout(() => {
      setIsNextLongPress(true);
      onNextLongPress?.();
    }, 500);
    setNextPressTimer(timer);
  }, [disabled, onNextLongPress, resetBacklight]);

  const handleNextMouseUp = useCallback(() => {
    if (nextPressTimer) {
      clearTimeout(nextPressTimer);
      setNextPressTimer(null);
    }
    if (isNextLongPress) {
      onSeekRelease?.();
    } else {
      onNext();
    }
    setIsNextLongPress(false);
  }, [nextPressTimer, isNextLongPress, onNext, onSeekRelease]);

  // Previous button handlers (long press for seeking backward)
  const handlePrevMouseDown = useCallback(() => {
    if (disabled) return;
    resetBacklight();
    setIsPrevLongPress(false);
    const timer = setTimeout(() => {
      setIsPrevLongPress(true);
      onPreviousLongPress?.();
    }, 500);
    setPrevPressTimer(timer);
  }, [disabled, onPreviousLongPress, resetBacklight]);

  const handlePrevMouseUp = useCallback(() => {
    if (prevPressTimer) {
      clearTimeout(prevPressTimer);
      setPrevPressTimer(null);
    }
    if (isPrevLongPress) {
      onSeekRelease?.();
    } else {
      onPrevious();
    }
    setIsPrevLongPress(false);
  }, [prevPressTimer, isPrevLongPress, onPrevious, onSeekRelease]);

  // Get store actions for keyboard shortcuts
  const { toggleHold, adjustVolume, showVolume } = useIPodStore();

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hold switch toggle always works
      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        toggleHold();
        return;
      }

      // Volume controls work even when hold is on
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        adjustVolume(5);
        showVolume();
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        adjustVolume(-5);
        showVolume();
        return;
      }

      // All other controls blocked when hold is on
      if (disabled || isHoldOn) return;
      resetBacklight();

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          onScroll("up");
          playClick();
          break;
        case "ArrowDown":
          e.preventDefault();
          onScroll("down");
          playClick();
          break;
        case "Enter":
          e.preventDefault();
          onSelect();
          break;
        case "Escape":
        case "Backspace":
          e.preventDefault();
          onMenu();
          break;
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrevious();
          break;
        case "s":
          e.preventDefault();
          onPlayPauseLongPress(); // 's' key for sleep
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onScroll,
    onSelect,
    onMenu,
    onPlayPause,
    onNext,
    onPrevious,
    playClick,
    disabled,
    onPlayPauseLongPress,
    resetBacklight,
    isHoldOn,
    toggleHold,
    adjustVolume,
    showVolume,
  ]);

  return (
    <div
      ref={wheelRef}
      className={`click-wheel ${disabled ? "disabled" : ""}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Menu button */}
      <button
        className="wheel-button menu-button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            resetBacklight();
            onMenu();
          }
        }}
        disabled={disabled}
      >
        MENU
      </button>

      {/* Previous button */}
      <button
        className={`wheel-button prev-button ${
          isPrevLongPress ? "seeking" : ""
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handlePrevMouseDown();
        }}
        onMouseUp={handlePrevMouseUp}
        onMouseLeave={() => {
          if (prevPressTimer) {
            clearTimeout(prevPressTimer);
            setPrevPressTimer(null);
          }
          if (isPrevLongPress) {
            onSeekRelease?.();
            setIsPrevLongPress(false);
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handlePrevMouseDown();
        }}
        onTouchEnd={handlePrevMouseUp}
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Next button */}
      <button
        className={`wheel-button next-button ${
          isNextLongPress ? "seeking" : ""
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleNextMouseDown();
        }}
        onMouseUp={handleNextMouseUp}
        onMouseLeave={() => {
          if (nextPressTimer) {
            clearTimeout(nextPressTimer);
            setNextPressTimer(null);
          }
          if (isNextLongPress) {
            onSeekRelease?.();
            setIsNextLongPress(false);
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleNextMouseDown();
        }}
        onTouchEnd={handleNextMouseUp}
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M6 18l8.5-6L6 6v12zm2-12v12l6.5-6L8 6zm8 0h2v12h-2z" />
        </svg>
      </button>

      {/* Play/Pause button */}
      <button
        className="wheel-button play-button"
        onMouseDown={(e) => {
          e.stopPropagation();
          handlePlayMouseDown();
        }}
        onMouseUp={handlePlayMouseUp}
        onMouseLeave={() => {
          if (playPressTimer) {
            clearTimeout(playPressTimer);
            setPlayPressTimer(null);
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handlePlayMouseDown();
        }}
        onTouchEnd={handlePlayMouseUp}
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M8 5v14l11-7z" />
          <path
            d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
            transform="translate(12, 0)"
          />
        </svg>
      </button>

      {/* Center select button */}
      <button
        className={`center-button ${isCenterLongPress ? "active" : ""}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleCenterMouseDown();
        }}
        onMouseUp={handleCenterMouseUp}
        onMouseLeave={() => {
          if (centerPressTimer) {
            clearTimeout(centerPressTimer);
            setCenterPressTimer(null);
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleCenterMouseDown();
        }}
        onTouchEnd={handleCenterMouseUp}
        disabled={disabled}
      />
    </div>
  );
}
