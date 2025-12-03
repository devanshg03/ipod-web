// iPod Types

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number; // in seconds
  genre: string;
  year: number;
  // For user-uploaded songs
  isUserSong?: boolean;
  audioBlob?: Blob;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year: number;
  songs: string[]; // song IDs
}

export interface Artist {
  id: string;
  name: string;
  albums: string[]; // album IDs
}

export interface Playlist {
  id: string;
  name: string;
  songs: string[]; // song IDs
}

export interface Photo {
  id: string;
  src: string;
  albumId: string;
  name: string;
}

export interface PhotoAlbum {
  id: string;
  name: string;
  coverPhoto: string;
  photos: string[]; // photo IDs
}

export type MenuItemType =
  | "navigation"
  | "action"
  | "toggle"
  | "select"
  | "submenu"
  | "nowPlaying"
  | "coverFlow"
  | "photoViewer"
  | "clock"
  | "settings";

export interface MenuItem {
  id: string;
  label: string;
  type: MenuItemType;
  icon?: string;
  subMenu?: MenuItem[];
  action?: string;
  value?: string | boolean;
  options?: string[];
}

export interface MenuScreen {
  id: string;
  title: string;
  items: MenuItem[];
  parent?: string;
}

export type ScreenType =
  | "menu"
  | "nowPlaying"
  | "coverFlow"
  | "photoViewer"
  | "photo"
  | "clock"
  | "stopwatch"
  | "timer"
  | "settings"
  | "about"
  | "musicUpload";

export interface iPodSettings {
  shuffle: "off" | "songs" | "albums";
  repeat: "off" | "one" | "all";
  backlightTimer: number; // seconds, 0 = always on
  brightness: number; // 0-100
  clicker: boolean;
  volume: number; // 0-100
}

export interface NowPlayingState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  queue: Song[];
  queueIndex: number;
}
