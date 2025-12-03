// IndexedDB wrapper for storing music library

import { Song } from "../types";

const DB_NAME = "iPodMusicLibrary";
const DB_VERSION = 1;
const SONGS_STORE = "songs";
const AUDIO_STORE = "audioBlobs";

interface StoredSong extends Omit<Song, "audioBlob"> {
  // audioBlob is stored separately in AUDIO_STORE
}

class MusicDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for song metadata
        if (!db.objectStoreNames.contains(SONGS_STORE)) {
          const songsStore = db.createObjectStore(SONGS_STORE, {
            keyPath: "id",
          });
          songsStore.createIndex("artist", "artist", { unique: false });
          songsStore.createIndex("album", "album", { unique: false });
          songsStore.createIndex("genre", "genre", { unique: false });
        }

        // Store for audio blobs (separate to allow lazy loading)
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: "id" });
        }
      };
    });

    return this.initPromise;
  }

  private async getDB(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  // Add a song with its audio blob
  async addSong(song: Song, audioBlob: Blob): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [SONGS_STORE, AUDIO_STORE],
        "readwrite"
      );

      transaction.onerror = () => reject(new Error("Failed to add song"));
      transaction.oncomplete = () => resolve();

      // Store song metadata (without the blob)
      const songData: StoredSong = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        duration: song.duration,
        genre: song.genre,
        year: song.year,
      };

      const songsStore = transaction.objectStore(SONGS_STORE);
      songsStore.put(songData);

      // Store audio blob separately
      const audioStore = transaction.objectStore(AUDIO_STORE);
      audioStore.put({ id: song.id, blob: audioBlob });
    });
  }

  // Get all songs (metadata only, no blobs)
  async getAllSongs(): Promise<Song[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SONGS_STORE, "readonly");
      const store = transaction.objectStore(SONGS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(new Error("Failed to get songs"));
      request.onsuccess = () => {
        const songs = request.result as StoredSong[];
        resolve(songs.map((s) => ({ ...s, isUserSong: true })));
      };
    });
  }

  // Get audio blob for a specific song
  async getAudioBlob(songId: string): Promise<Blob | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(AUDIO_STORE, "readonly");
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(songId);

      request.onerror = () => reject(new Error("Failed to get audio blob"));
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
    });
  }

  // Remove a song and its audio blob
  async removeSong(songId: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [SONGS_STORE, AUDIO_STORE],
        "readwrite"
      );

      transaction.onerror = () => reject(new Error("Failed to remove song"));
      transaction.oncomplete = () => resolve();

      const songsStore = transaction.objectStore(SONGS_STORE);
      songsStore.delete(songId);

      const audioStore = transaction.objectStore(AUDIO_STORE);
      audioStore.delete(songId);
    });
  }

  // Clear all songs
  async clearAll(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [SONGS_STORE, AUDIO_STORE],
        "readwrite"
      );

      transaction.onerror = () => reject(new Error("Failed to clear database"));
      transaction.oncomplete = () => resolve();

      const songsStore = transaction.objectStore(SONGS_STORE);
      songsStore.clear();

      const audioStore = transaction.objectStore(AUDIO_STORE);
      audioStore.clear();
    });
  }

  // Get count of songs
  async getSongCount(): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SONGS_STORE, "readonly");
      const store = transaction.objectStore(SONGS_STORE);
      const request = store.count();

      request.onerror = () => reject(new Error("Failed to count songs"));
      request.onsuccess = () => resolve(request.result);
    });
  }
}

// Export singleton
export const musicDB = new MusicDB();

