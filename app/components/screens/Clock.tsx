"use client";

import { useState, useEffect, useCallback } from "react";
import { useIPodStore } from "../../store/iPodStore";

type ClockMode = "clock" | "stopwatch" | "timer";

interface ClockProps {
  mode: ClockMode;
}

export default function Clock({ mode }: ClockProps) {
  const [time, setTime] = useState(new Date());
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [timerTime, setTimerTime] = useState(300); // 5 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState(300);

  const { resetBacklight } = useIPodStore();

  // Clock update
  useEffect(() => {
    if (mode !== "clock") return;

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // Stopwatch
  useEffect(() => {
    if (mode !== "stopwatch" || !isStopwatchRunning) return;

    const interval = setInterval(() => {
      setStopwatchTime((prev) => prev + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [mode, isStopwatchRunning]);

  // Timer
  useEffect(() => {
    if (mode !== "timer" || !isTimerRunning || timerTime <= 0) return;

    const interval = setInterval(() => {
      setTimerTime((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isTimerRunning, timerTime]);

  // Handle select button press (exposed to parent via window)
  const handleSelect = useCallback(() => {
    resetBacklight();
    if (mode === "stopwatch") {
      if (isStopwatchRunning) {
        // Add lap
        setLaps((prev) => [stopwatchTime, ...prev].slice(0, 5));
      } else if (stopwatchTime > 0) {
        // Reset
        setStopwatchTime(0);
        setLaps([]);
      } else {
        // Start
        setIsStopwatchRunning(true);
      }
    } else if (mode === "timer") {
      if (timerTime === 0) {
        setTimerTime(timerInitial);
      } else {
        setIsTimerRunning(!isTimerRunning);
      }
    }
  }, [
    mode,
    isStopwatchRunning,
    stopwatchTime,
    timerTime,
    timerInitial,
    isTimerRunning,
    resetBacklight,
  ]);

  const handlePlayPause = useCallback(() => {
    resetBacklight();
    if (mode === "stopwatch") {
      setIsStopwatchRunning(!isStopwatchRunning);
    } else if (mode === "timer") {
      if (timerTime > 0) {
        setIsTimerRunning(!isTimerRunning);
      }
    }
  }, [mode, isStopwatchRunning, isTimerRunning, timerTime, resetBacklight]);

  // Expose handlers
  useEffect(() => {
    (window as unknown as { clockSelect?: () => void }).clockSelect =
      handleSelect;
    (window as unknown as { clockPlayPause?: () => void }).clockPlayPause =
      handlePlayPause;
    return () => {
      delete (window as unknown as { clockSelect?: () => void }).clockSelect;
      delete (window as unknown as { clockPlayPause?: () => void })
        .clockPlayPause;
    };
  }, [handleSelect, handlePlayPause]);

  const formatStopwatch = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatLap = (ms: number, index: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `Lap ${index + 1}   ${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  // ==================== CLOCK ====================
  if (mode === "clock") {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const isPM = hours >= 12;
    const displayHours = hours % 12 || 12;

    return (
      <div className="ipod-clock">
        <div className="clock-city-name">Cupertino</div>

        <div className="clock-analog-container">
          <div className="clock-analog-face">
            {/* Hour markers - lines like original iPod */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="clock-hour-marker"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                }}
              >
                <div className={`marker-tick ${i % 3 === 0 ? "major" : ""}`} />
              </div>
            ))}

            {/* Hour hand */}
            <div
              className="clock-hand-hour"
              style={{
                transform: `rotate(${
                  (hours % 12) * 30 + minutes * 0.5 - 90
                }deg)`,
              }}
            />
            {/* Minute hand */}
            <div
              className="clock-hand-minute"
              style={{
                transform: `rotate(${minutes * 6 - 90}deg)`,
              }}
            />
            <div className="clock-center-dot" />
          </div>
        </div>

        <div className="clock-digital">
          <span className="clock-time-main">
            {displayHours}:{minutes.toString().padStart(2, "0")}
          </span>
          <span className="clock-time-ampm">{isPM ? "PM" : "AM"}</span>
        </div>

        <div className="clock-date-display">
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    );
  }

  // ==================== STOPWATCH ====================
  if (mode === "stopwatch") {
    return (
      <div className="ipod-stopwatch">
        <div className="stopwatch-display-main">
          {formatStopwatch(stopwatchTime)}
        </div>

        <div className="stopwatch-status">
          {isStopwatchRunning ? (
            <span className="status-running">● Running</span>
          ) : stopwatchTime > 0 ? (
            <span className="status-stopped">■ Stopped</span>
          ) : (
            <span className="status-ready">Ready</span>
          )}
        </div>

        <div className="stopwatch-controls-hint">
          {isStopwatchRunning ? (
            <>▶▌▌ Pause · ● Lap</>
          ) : stopwatchTime > 0 ? (
            <>▶ Resume · ● Reset</>
          ) : (
            <>▶ Start</>
          )}
        </div>

        {laps.length > 0 && (
          <div className="stopwatch-laps">
            {laps.map((lap, i) => (
              <div key={i} className="lap-item">
                {formatLap(lap, laps.length - 1 - i)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==================== TIMER ====================
  return (
    <div className="ipod-timer">
      <div
        className={`timer-display-main ${timerTime === 0 ? "finished" : ""}`}
      >
        {formatTimer(timerTime)}
      </div>

      {timerTime === 0 ? (
        <div className="timer-complete">
          <span>Done</span>
        </div>
      ) : (
        <div className="timer-status">
          {isTimerRunning ? (
            <span className="status-running">● Counting Down</span>
          ) : (
            <span className="status-paused">▌▌ Paused</span>
          )}
        </div>
      )}

      <div className="timer-controls-hint">
        {timerTime === 0 ? (
          <>● Reset Timer</>
        ) : isTimerRunning ? (
          <>▶▌▌ Pause</>
        ) : (
          <>▶ Start</>
        )}
      </div>
    </div>
  );
}
