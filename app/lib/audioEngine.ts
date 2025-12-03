// Audio Engine - Singleton wrapper for HTML5 Audio API

type AudioEventCallback = (data: unknown) => void;

interface AudioEngineEvents {
  timeupdate: (currentTime: number) => void;
  ended: () => void;
  play: () => void;
  pause: () => void;
  loadedmetadata: (duration: number) => void;
  error: (error: Error) => void;
}

class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement | null = null;
  private listeners: Map<string, Set<AudioEventCallback>> = new Map();
  private currentBlobUrl: string | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.initAudio();
    }
  }

  private initAudio() {
    this.audio = new Audio();
    this.audio.preload = "metadata";

    this.audio.addEventListener("timeupdate", () => {
      this.emit("timeupdate", this.audio!.currentTime);
    });

    this.audio.addEventListener("ended", () => {
      this.emit("ended", undefined);
    });

    this.audio.addEventListener("play", () => {
      this.emit("play", undefined);
    });

    this.audio.addEventListener("pause", () => {
      this.emit("pause", undefined);
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.emit("loadedmetadata", this.audio!.duration);
    });

    this.audio.addEventListener("error", () => {
      this.emit("error", new Error("Audio playback error"));
    });
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // Load audio from a Blob
  loadBlob(blob: Blob): Promise<void> {
    if (!this.audio) {
      this.initAudio();
    }

    // Pause and reset current audio to prevent interruption
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    // Revoke previous blob URL to prevent memory leaks
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }

    this.currentBlobUrl = URL.createObjectURL(blob);
    this.audio!.src = this.currentBlobUrl;
    this.audio!.load();

    // Return a promise that resolves when audio is ready to play
    return new Promise((resolve, reject) => {
      if (!this.audio) {
        reject(new Error("Audio element not initialized"));
        return;
      }

      const handleCanPlay = () => {
        this.audio!.removeEventListener("canplay", handleCanPlay);
        this.audio!.removeEventListener("error", handleError);
        resolve();
      };

      const handleError = () => {
        this.audio!.removeEventListener("canplay", handleCanPlay);
        this.audio!.removeEventListener("error", handleError);
        reject(new Error("Failed to load audio"));
      };

      // If already ready, resolve immediately
      if (this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        resolve();
      } else {
        this.audio.addEventListener("canplay", handleCanPlay, { once: true });
        this.audio.addEventListener("error", handleError, { once: true });
      }
    });
  }

  // Load audio from a URL (for demo/mock songs)
  loadUrl(url: string): void {
    if (!this.audio) {
      this.initAudio();
    }

    // Revoke previous blob URL if exists
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    this.audio!.src = url;
    this.audio!.load();
  }

  play(): Promise<void> {
    if (!this.audio) return Promise.resolve();

    // If audio is not ready, wait for it
    if (this.audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      return new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          this.audio!.removeEventListener("canplay", handleCanPlay);
          this.audio!.removeEventListener("error", handleError);
          this.audio!.play().then(resolve).catch(reject);
        };

        const handleError = () => {
          this.audio!.removeEventListener("canplay", handleCanPlay);
          this.audio!.removeEventListener("error", handleError);
          reject(new Error("Audio not ready"));
        };

        this.audio.addEventListener("canplay", handleCanPlay, { once: true });
        this.audio.addEventListener("error", handleError, { once: true });
      });
    }

    return this.audio.play().catch((error) => {
      // Ignore AbortError - it means a new load interrupted the play request
      if (error.name !== "AbortError") {
        throw error;
      }
      return Promise.resolve();
    });
  }

  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  stop(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(time: number): void {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(
      0,
      Math.min(time, this.audio.duration || 0)
    );
  }

  setVolume(volume: number): void {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, volume / 100));
  }

  getVolume(): number {
    if (!this.audio) return 50;
    return this.audio.volume * 100;
  }

  getCurrentTime(): number {
    if (!this.audio) return 0;
    return this.audio.currentTime;
  }

  getDuration(): number {
    if (!this.audio) return 0;
    return this.audio.duration || 0;
  }

  isPlaying(): boolean {
    if (!this.audio) return false;
    return !this.audio.paused;
  }

  // Event system
  on<K extends keyof AudioEngineEvents>(
    event: K,
    callback: AudioEngineEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as AudioEventCallback);
  }

  off<K extends keyof AudioEngineEvents>(
    event: K,
    callback: AudioEngineEvents[K]
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as AudioEventCallback);
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Cleanup
  destroy(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }
    this.listeners.clear();
  }
}

// Export singleton getter
export const getAudioEngine = (): AudioEngine => AudioEngine.getInstance();

export default AudioEngine;
