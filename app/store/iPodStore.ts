import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Song, iPodSettings, ScreenType } from "../types";

interface NavigationItem {
  screenType: ScreenType;
  screenId: string;
  title: string;
  selectedIndex: number;
  data?: unknown;
}

interface iPodState {
  // Navigation
  navigationStack: NavigationItem[];
  currentScreen: NavigationItem;
  selectedIndex: number;

  // Now Playing
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  queue: Song[];
  queueIndex: number;

  // Scrubbing
  isScrubbing: boolean;

  // Ratings (songId -> rating 0-5)
  songRatings: Record<string, number>;

  // Sleep/Wake
  isSleeping: boolean;

  // Hold switch
  isHoldOn: boolean;

  // Volume overlay
  showVolumeOverlay: boolean;
  volumeOverlayTimeout: NodeJS.Timeout | null;

  // Seeking (hold forward/back)
  isSeeking: boolean;
  seekDirection: "forward" | "backward" | null;

  // Backlight
  backlightOn: boolean;
  lastActivityTime: number;

  // Settings
  settings: iPodSettings;

  // Wheel state
  wheelVelocity: number;

  // Photo viewer
  currentPhotoIndex: number;
  currentPhotoAlbumId: string | null;

  // User music library
  userSongs: Song[];
  userLibraryLoaded: boolean;

  // Actions
  navigateTo: (screen: NavigationItem) => void;
  goBack: () => void;
  setSelectedIndex: (index: number) => void;
  incrementSelectedIndex: (max: number) => void;
  decrementSelectedIndex: () => void;

  // Playback
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setCurrentTime: (time: number) => void;
  shufflePlay: () => void;

  // Scrubbing
  startScrubbing: () => void;
  stopScrubbing: () => void;
  scrub: (delta: number) => void;

  // Ratings
  setRating: (songId: string, rating: number) => void;
  getRating: (songId: string) => number;

  // Sleep/Wake
  sleep: () => void;
  wake: () => void;
  toggleSleep: () => void;

  // Backlight
  resetBacklight: () => void;
  dimBacklight: () => void;

  // Settings
  updateSettings: (settings: Partial<iPodSettings>) => void;

  // Wheel
  setWheelVelocity: (velocity: number) => void;

  // Photos
  setCurrentPhoto: (albumId: string, index: number) => void;
  nextPhoto: () => void;
  previousPhoto: () => void;

  // User library
  setUserSongs: (songs: Song[]) => void;
  addUserSong: (song: Song) => void;
  removeUserSong: (songId: string) => void;
  setUserLibraryLoaded: (loaded: boolean) => void;

  // Hold switch
  toggleHold: () => void;
  setHold: (on: boolean) => void;

  // Volume
  adjustVolume: (delta: number) => void;
  showVolume: () => void;
  hideVolume: () => void;

  // Seeking
  startSeeking: (direction: "forward" | "backward") => void;
  stopSeeking: () => void;
}

const defaultSettings: iPodSettings = {
  shuffle: "off",
  repeat: "off",
  backlightTimer: 10,
  brightness: 80,
  clicker: true,
  volume: 50,
};

const initialScreen: NavigationItem = {
  screenType: "menu",
  screenId: "main",
  title: "iPod",
  selectedIndex: 0,
};

export const useIPodStore = create<iPodState>()(
  persist(
    (set, get) => ({
      // Initial state
      navigationStack: [],
      currentScreen: initialScreen,
      selectedIndex: 0,

      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      queue: [],
      queueIndex: 0,

      isScrubbing: false,
      songRatings: {},
      isSleeping: false,
      isHoldOn: false,
      showVolumeOverlay: false,
      volumeOverlayTimeout: null,
      isSeeking: false,
      seekDirection: null,
      backlightOn: true,
      lastActivityTime: Date.now(),

      settings: defaultSettings,
      wheelVelocity: 0,

      currentPhotoIndex: 0,
      currentPhotoAlbumId: null,

      // User library
      userSongs: [],
      userLibraryLoaded: false,

      // Navigation actions
      navigateTo: (screen) =>
        set((state) => ({
          navigationStack: [
            ...state.navigationStack,
            { ...state.currentScreen, selectedIndex: state.selectedIndex },
          ],
          currentScreen: screen,
          selectedIndex: screen.selectedIndex || 0,
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      goBack: () =>
        set((state) => {
          if (state.navigationStack.length === 0) return state;
          const newStack = [...state.navigationStack];
          const previousScreen = newStack.pop()!;
          return {
            navigationStack: newStack,
            currentScreen: previousScreen,
            selectedIndex: previousScreen.selectedIndex,
            lastActivityTime: Date.now(),
            backlightOn: true,
          };
        }),

      setSelectedIndex: (index) =>
        set({
          selectedIndex: index,
          lastActivityTime: Date.now(),
          backlightOn: true,
        }),

      incrementSelectedIndex: (max) =>
        set((state) => ({
          selectedIndex: Math.min(state.selectedIndex + 1, max - 1),
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      decrementSelectedIndex: () =>
        set((state) => ({
          selectedIndex: Math.max(state.selectedIndex - 1, 0),
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      // Playback actions
      playSong: (song, queue) =>
        set((state) => {
          const newQueue = queue || [song];
          const queueIndex = newQueue.findIndex((s) => s.id === song.id);
          return {
            currentSong: song,
            isPlaying: true,
            currentTime: 0,
            queue: newQueue,
            queueIndex: queueIndex >= 0 ? queueIndex : 0,
            lastActivityTime: Date.now(),
            backlightOn: true,
          };
        }),

      togglePlayPause: () =>
        set((state) => ({
          isPlaying: !state.isPlaying,
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      nextTrack: () =>
        set((state) => {
          if (state.queue.length === 0) return state;

          let nextIndex = state.queueIndex + 1;

          if (state.settings.repeat === "one") {
            nextIndex = state.queueIndex;
          } else if (nextIndex >= state.queue.length) {
            if (state.settings.repeat === "all") {
              nextIndex = 0;
            } else {
              return { ...state, isPlaying: false };
            }
          }

          if (state.settings.shuffle === "songs") {
            nextIndex = Math.floor(Math.random() * state.queue.length);
          }

          return {
            currentSong: state.queue[nextIndex],
            queueIndex: nextIndex,
            currentTime: 0,
            lastActivityTime: Date.now(),
            backlightOn: true,
          };
        }),

      previousTrack: () =>
        set((state) => {
          if (state.queue.length === 0) return state;

          // If more than 3 seconds into song, restart it
          if (state.currentTime > 3) {
            return {
              currentTime: 0,
              lastActivityTime: Date.now(),
              backlightOn: true,
            };
          }

          let prevIndex = state.queueIndex - 1;
          if (prevIndex < 0) {
            prevIndex =
              state.settings.repeat === "all" ? state.queue.length - 1 : 0;
          }

          return {
            currentSong: state.queue[prevIndex],
            queueIndex: prevIndex,
            currentTime: 0,
            lastActivityTime: Date.now(),
            backlightOn: true,
          };
        }),

      setCurrentTime: (time) => set({ currentTime: time }),

      shufflePlay: () => {
        const state = get();
        if (state.userSongs.length === 0) return;
        const shuffled = [...state.userSongs].sort(() => Math.random() - 0.5);
        set({
          currentSong: shuffled[0],
          isPlaying: true,
          currentTime: 0,
          queue: shuffled,
          queueIndex: 0,
          lastActivityTime: Date.now(),
          backlightOn: true,
        });
      },

      // Scrubbing actions
      startScrubbing: () =>
        set({
          isScrubbing: true,
          lastActivityTime: Date.now(),
          backlightOn: true,
        }),

      stopScrubbing: () =>
        set({
          isScrubbing: false,
          lastActivityTime: Date.now(),
          backlightOn: true,
        }),

      scrub: (delta) =>
        set((state) => {
          if (!state.currentSong || !state.isScrubbing) return state;
          const newTime = Math.max(
            0,
            Math.min(state.currentSong.duration, state.currentTime + delta)
          );
          return {
            currentTime: newTime,
            lastActivityTime: Date.now(),
            backlightOn: true,
          };
        }),

      // Rating actions
      setRating: (songId, rating) =>
        set((state) => ({
          songRatings: { ...state.songRatings, [songId]: rating },
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      getRating: (songId) => {
        return get().songRatings[songId] || 0;
      },

      // Sleep/Wake actions
      sleep: () =>
        set({
          isSleeping: true,
          isPlaying: false,
          backlightOn: false,
        }),

      wake: () =>
        set({
          isSleeping: false,
          backlightOn: true,
          lastActivityTime: Date.now(),
        }),

      toggleSleep: () => {
        const state = get();
        if (state.isSleeping) {
          set({
            isSleeping: false,
            backlightOn: true,
            lastActivityTime: Date.now(),
          });
        } else {
          set({ isSleeping: true, isPlaying: false, backlightOn: false });
        }
      },

      // Backlight actions
      resetBacklight: () =>
        set({
          backlightOn: true,
          lastActivityTime: Date.now(),
        }),

      dimBacklight: () => set({ backlightOn: false }),

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      // Wheel actions
      setWheelVelocity: (velocity) => set({ wheelVelocity: velocity }),

      // Photo actions
      setCurrentPhoto: (albumId, index) =>
        set({
          currentPhotoAlbumId: albumId,
          currentPhotoIndex: index,
          lastActivityTime: Date.now(),
          backlightOn: true,
        }),

      nextPhoto: () =>
        set((state) => ({
          currentPhotoIndex: state.currentPhotoIndex + 1,
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      previousPhoto: () =>
        set((state) => ({
          currentPhotoIndex: Math.max(0, state.currentPhotoIndex - 1),
          lastActivityTime: Date.now(),
          backlightOn: true,
        })),

      // User library actions
      setUserSongs: (userSongs) => set({ userSongs }),

      addUserSong: (song) =>
        set((state) => ({
          userSongs: [...state.userSongs, song],
        })),

      removeUserSong: (songId) =>
        set((state) => ({
          userSongs: state.userSongs.filter((s) => s.id !== songId),
        })),

      setUserLibraryLoaded: (loaded) => set({ userLibraryLoaded: loaded }),

      // Hold switch actions
      toggleHold: () =>
        set((state) => ({
          isHoldOn: !state.isHoldOn,
        })),

      setHold: (on) => set({ isHoldOn: on }),

      // Volume actions
      adjustVolume: (delta) =>
        set((state) => {
          const newVolume = Math.max(
            0,
            Math.min(100, state.settings.volume + delta)
          );
          return {
            settings: { ...state.settings, volume: newVolume },
            showVolumeOverlay: true,
            lastActivityTime: Date.now(),
            backlightOn: true,
          };
        }),

      showVolume: () => {
        const state = get();
        if (state.volumeOverlayTimeout) {
          clearTimeout(state.volumeOverlayTimeout);
        }
        const timeout = setTimeout(() => {
          set({ showVolumeOverlay: false, volumeOverlayTimeout: null });
        }, 1500);
        set({ showVolumeOverlay: true, volumeOverlayTimeout: timeout });
      },

      hideVolume: () => {
        const state = get();
        if (state.volumeOverlayTimeout) {
          clearTimeout(state.volumeOverlayTimeout);
        }
        set({ showVolumeOverlay: false, volumeOverlayTimeout: null });
      },

      // Seeking actions
      startSeeking: (direction) =>
        set({
          isSeeking: true,
          seekDirection: direction,
          lastActivityTime: Date.now(),
          backlightOn: true,
        }),

      stopSeeking: () =>
        set({
          isSeeking: false,
          seekDirection: null,
        }),
    }),
    {
      name: "ipod-storage",
      partialize: (state) => ({
        settings: state.settings,
        songRatings: state.songRatings,
      }),
    }
  )
);
