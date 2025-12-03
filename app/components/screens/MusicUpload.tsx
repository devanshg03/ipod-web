"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useIPodStore } from "../../store/iPodStore";
import { musicDB } from "../../lib/musicDB";
import { Song } from "../../types";

interface UploadState {
  isUploading: boolean;
  progress: number;
  currentFile: string;
  error: string | null;
}

// Generate a unique ID for uploaded songs
function generateId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Default album art gradient for songs without embedded artwork
const defaultAlbumArt =
  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";

// Convert array buffer to data URL for album art
function arrayBufferToDataUrl(buffer: Uint8Array, mimeType: string): string {
  const base64 = btoa(
    Array.from(buffer)
      .map((byte) => String.fromCharCode(byte))
      .join("")
  );
  return `data:${mimeType};base64,${base64}`;
}

// Extract metadata from audio file using music-metadata
async function extractMetadata(
  file: File
): Promise<Omit<Song, "id" | "isUserSong">> {
  // Dynamically import music-metadata to avoid SSR issues
  const { parseBlob } = await import("music-metadata");

  try {
    const metadata = await parseBlob(file);
    const { common, format } = metadata;

    // Get album art if available
    let albumArt = defaultAlbumArt;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      albumArt = arrayBufferToDataUrl(pic.data, pic.format);
    }

    return {
      title: common.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: common.artist || "Unknown Artist",
      album: common.album || "Unknown Album",
      albumArt,
      duration: Math.floor(format.duration || 0),
      genre: common.genre?.[0] || "Unknown",
      year: common.year || new Date().getFullYear(),
    };
  } catch (error) {
    console.error("Failed to parse metadata:", error);

    // Fallback: try to at least get duration from audio element
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(audio.duration);
        URL.revokeObjectURL(audio.src);

        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          album: "Unknown Album",
          albumArt: defaultAlbumArt,
          duration,
          genre: "Unknown",
          year: new Date().getFullYear(),
        });
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(audio.src);
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          album: "Unknown Album",
          albumArt: defaultAlbumArt,
          duration: 0,
          genre: "Unknown",
          year: new Date().getFullYear(),
        });
      });
    });
  }
}

export default function MusicUpload() {
  const {
    userSongs,
    addUserSong,
    setUserSongs,
    userLibraryLoaded,
    setUserLibraryLoaded,
  } = useIPodStore();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    currentFile: "",
    error: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user library from IndexedDB on mount
  useEffect(() => {
    if (!userLibraryLoaded) {
      musicDB.getAllSongs().then((songs) => {
        setUserSongs(songs);
        setUserLibraryLoaded(true);
      });
    }
  }, [userLibraryLoaded, setUserSongs, setUserLibraryLoaded]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const audioFiles = Array.from(files).filter(
        (file) =>
          file.type.startsWith("audio/") ||
          file.name.match(/\.(mp3|m4a|wav|ogg|flac)$/i)
      );

      if (audioFiles.length === 0) {
        setUploadState((prev) => ({
          ...prev,
          error: "No audio files found",
        }));
        return;
      }

      setUploadState({
        isUploading: true,
        progress: 0,
        currentFile: "",
        error: null,
      });

      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        setUploadState((prev) => ({
          ...prev,
          currentFile: file.name,
          progress: Math.round(((i + 0.5) / audioFiles.length) * 100),
        }));

        try {
          const metadata = await extractMetadata(file);
          const song: Song = {
            id: generateId(),
            ...metadata,
            isUserSong: true,
          };

          // Store in IndexedDB
          await musicDB.addSong(song, file);

          // Add to store
          addUserSong(song);
        } catch (err) {
          console.error("Failed to process file:", file.name, err);
        }
      }

      setUploadState({
        isUploading: false,
        progress: 100,
        currentFile: "",
        error: null,
      });
    },
    [addUserSong]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="connected-screen">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <div
        className={`screen-content ${isDragging ? "dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {/* Orange dock connector icon */}
        <div className="dock-icon">
          <img
            src="https://static.thenounproject.com/png/apple-30-pin-cable-icon-1125203-512.png"
            alt="Dock connector"
            className="connector-image"
          />
        </div>

        {/* Status text */}
        <div className="status-text">
          {uploadState.isUploading ? (
            <>
              <div className="main-text">Syncing</div>
              <div className="sub-text">{uploadState.currentFile}</div>
              <div className="progress-container">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="main-text">Connected</div>
              <div className="sub-text">
                {isDragging
                  ? "Drop to sync music"
                  : "Eject before disconnecting."}
              </div>
            </>
          )}
        </div>
      </div>

      {uploadState.error && (
        <div className="error-text">{uploadState.error}</div>
      )}

      <style jsx>{`
        .connected-screen {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(
            180deg,
            #b8d4f0 0%,
            #9ec5e8 30%,
            #7eb3de 60%,
            #5a9fd4 100%
          );
          cursor: pointer;
          font-family: "Chicago", "Helvetica Neue", Helvetica, Arial, sans-serif;
        }

        .screen-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .screen-content.dragging {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Orange dock connector icon */
        .dock-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(
            180deg,
            #ffd060 0%,
            #f5a623 30%,
            #e8941c 70%,
            #d4820f 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25),
            inset 0 1px 2px rgba(255, 255, 255, 0.4);
          padding: 14px;
        }

        .connector-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(0.2);
        }

        /* Status text */
        .status-text {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .main-text {
          font-size: 15px;
          font-weight: bold;
          color: #000;
          margin-bottom: 2px;
        }

        .sub-text {
          font-size: 11px;
          color: #1a1a1a;
          max-width: 160px;
        }

        .progress-container {
          width: 120px;
          height: 6px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #fff, #e0e0e0);
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
        }

        .error-text {
          color: #cc0000;
          font-size: 10px;
          text-align: center;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.8);
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
