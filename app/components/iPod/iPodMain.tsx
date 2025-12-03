"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import IPodShell from "./iPodShell";
import MenuList, { MenuItemData } from "../menus/MenuList";
import NowPlaying from "../screens/NowPlaying";
import PhotoViewer from "../screens/PhotoViewer";
import Clock from "../screens/Clock";
import Settings from "../screens/Settings";
import BootScreen from "../screens/BootScreen";
import MusicUpload from "../screens/MusicUpload";
import { useIPodStore } from "../../store/iPodStore";
import { musicDB } from "../../lib/musicDB";
import { photoAlbums, getPhotosByAlbum } from "../../data/mockData";
import { Song } from "../../types";

export default function IPodMain() {
  const [isBooting, setIsBooting] = useState(true);

  const {
    currentScreen,
    selectedIndex,
    navigateTo,
    playSong,
    currentSong,
    shufflePlay,
    settings,
    updateSettings,
    currentPhotoIndex,
    currentPhotoAlbumId,
    setCurrentPhoto,
    userSongs,
    setUserSongs,
    userLibraryLoaded,
    setUserLibraryLoaded,
  } = useIPodStore();

  // Load user library from IndexedDB on mount
  useEffect(() => {
    if (!userLibraryLoaded) {
      musicDB.getAllSongs().then((loadedSongs) => {
        setUserSongs(loadedSongs);
        setUserLibraryLoaded(true);
      });
    }
  }, [userLibraryLoaded, setUserSongs, setUserLibraryLoaded]);

  // All songs are user-uploaded songs
  const allSongs = userSongs;

  // Derive albums from user songs
  const derivedAlbums = useMemo(() => {
    const albumMap = new Map<
      string,
      {
        title: string;
        artist: string;
        artwork: string;
        year: number;
        songs: string[];
      }
    >();

    userSongs.forEach((song) => {
      const albumKey = `${song.album}-${song.artist}`;
      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, {
          title: song.album,
          artist: song.artist,
          artwork:
            song.albumArt ||
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          year: song.year || new Date().getFullYear(),
          songs: [],
        });
      }
      albumMap.get(albumKey)!.songs.push(song.id);
    });

    return Array.from(albumMap.entries()).map(([key, album], index) => ({
      id: `album-${index}`,
      ...album,
    }));
  }, [userSongs]);

  // Derive artists from user songs
  const derivedArtists = useMemo(() => {
    const artistSet = new Set<string>();
    userSongs.forEach((song) => artistSet.add(song.artist));
    return Array.from(artistSet).map((name, index) => ({
      id: `artist-${index}`,
      name,
    }));
  }, [userSongs]);

  // Derive genres from user songs
  const derivedGenres = useMemo(() => {
    const genreSet = new Set<string>();
    userSongs.forEach((song) => {
      if (song.genre) genreSet.add(song.genre);
    });
    return Array.from(genreSet);
  }, [userSongs]);

  // Helper functions for derived data
  const getSongsByAlbum = useCallback(
    (albumTitle: string) => {
      return userSongs.filter((s) => s.album === albumTitle);
    },
    [userSongs]
  );

  const getAlbumsByArtist = useCallback(
    (artistName: string) => {
      return derivedAlbums.filter((a) => a.artist === artistName);
    },
    [derivedAlbums]
  );

  const getSongsByGenre = useCallback(
    (genre: string) => {
      return userSongs.filter((s) => s.genre === genre);
    },
    [userSongs]
  );

  // Generate menu items based on current screen
  const menuItems = useMemo((): MenuItemData[] => {
    const { screenId, screenType, data } = currentScreen;

    if (screenType === "menu") {
      switch (screenId) {
        case "main":
          return [
            { id: "music", label: "Music", hasSubmenu: true },
            { id: "photos", label: "Photos", hasSubmenu: true },
            { id: "extras", label: "Extras", hasSubmenu: true },
            { id: "settings", label: "Settings", hasSubmenu: true },
            { id: "shuffle", label: "Shuffle Songs" },
            ...(currentSong
              ? [{ id: "nowPlaying", label: "Now Playing", hasSubmenu: true }]
              : []),
          ];

        case "music":
          return [
            { id: "artists", label: "Artists", hasSubmenu: true },
            { id: "albums", label: "Albums", hasSubmenu: true },
            { id: "songs", label: "Songs", hasSubmenu: true },
            { id: "genres", label: "Genres", hasSubmenu: true },
            { id: "addMusic", label: "Add Music...", hasSubmenu: true },
          ];

        case "artists":
          return derivedArtists.map((a) => ({
            id: `artist-${a.name}`,
            label: a.name,
            hasSubmenu: true,
          }));

        case "albums":
          return derivedAlbums.map((a) => ({
            id: `album-${a.title}-${a.artist}`,
            label: a.title,
            hasSubmenu: true,
            rightText: a.artist,
          }));

        case "songs":
          return allSongs.map((s) => ({
            id: `song-${s.id}`,
            label: s.title,
            rightText: s.artist,
          }));

        case "genres":
          return derivedGenres.map((g) => ({
            id: `genre-${g}`,
            label: g,
            hasSubmenu: true,
          }));

        case "photos":
          return [
            { id: "photoLibrary", label: "Photo Library", hasSubmenu: true },
            ...photoAlbums.map((a) => ({
              id: `photoAlbum-${a.id}`,
              label: a.name,
              hasSubmenu: true,
              rightText: `${a.photos.length}`,
            })),
          ];

        case "extras":
          return [
            { id: "clock", label: "Clock", hasSubmenu: true },
            { id: "stopwatch", label: "Stopwatch", hasSubmenu: true },
            { id: "timer", label: "Timer", hasSubmenu: true },
          ];

        case "settings":
          return [
            { id: "about", label: "About", hasSubmenu: true },
            {
              id: "settingShuffle",
              label: "Shuffle",
              hasSubmenu: true,
              rightText: settings.shuffle === "off" ? "Off" : settings.shuffle,
            },
            {
              id: "settingRepeat",
              label: "Repeat",
              hasSubmenu: true,
              rightText: settings.repeat === "off" ? "Off" : settings.repeat,
            },
            {
              id: "settingBacklight",
              label: "Backlight Timer",
              hasSubmenu: true,
              rightText:
                settings.backlightTimer === 0
                  ? "Always On"
                  : `${settings.backlightTimer}s`,
            },
            { id: "settingBrightness", label: "Brightness", hasSubmenu: true },
            {
              id: "settingClicker",
              label: "Clicker",
              hasSubmenu: true,
              rightText: settings.clicker ? "On" : "Off",
            },
            { id: "resetSettings", label: "Reset Settings" },
          ];

        default:
          // Handle dynamic screens
          if (screenId.startsWith("artist-")) {
            const artistName = (data as { artistName: string })?.artistName;
            const artistAlbums = getAlbumsByArtist(artistName);
            return artistAlbums.map((a) => ({
              id: `album-${a.title}-${a.artist}`,
              label: a.title,
              hasSubmenu: true,
              rightText: `${a.year}`,
            }));
          }

          if (screenId.startsWith("album-")) {
            const albumTitle = (data as { albumTitle: string })?.albumTitle;
            const albumSongs = getSongsByAlbum(albumTitle);
            return albumSongs.map((s) => ({
              id: `song-${s.id}`,
              label: s.title,
              rightText: formatDuration(s.duration),
            }));
          }

          if (screenId.startsWith("genre-")) {
            const genre = (data as { genre: string })?.genre;
            const genreSongs = getSongsByGenre(genre);
            return genreSongs.map((s) => ({
              id: `song-${s.id}`,
              label: s.title,
              rightText: s.artist,
            }));
          }

          if (screenId.startsWith("photoAlbum-")) {
            const albumId = (data as { albumId: string })?.albumId;
            const albumPhotos = getPhotosByAlbum(albumId);
            return albumPhotos.map((p, i) => ({
              id: `photo-${p.id}`,
              label: p.name,
              rightText: `${i + 1}`,
            }));
          }

          return [];
      }
    }

    return [];
  }, [
    currentScreen,
    currentSong,
    settings,
    allSongs,
    derivedAlbums,
    derivedArtists,
    derivedGenres,
    getAlbumsByArtist,
    getSongsByAlbum,
    getSongsByGenre,
  ]);

  const handleSelect = useCallback(() => {
    const { screenId, screenType, data } = currentScreen;
    const selectedItem = menuItems[selectedIndex];

    if (!selectedItem && screenType === "menu") return;

    // Handle Photo Viewer - do nothing on select, use wheel to navigate
    if (screenType === "photoViewer") {
      return;
    }

    // Handle settings screens
    if (screenType === "settings") {
      const settingData = data as { settingType: string };

      if (settingData.settingType === "shuffle") {
        const options: Array<"off" | "songs" | "albums"> = [
          "off",
          "songs",
          "albums",
        ];
        updateSettings({ shuffle: options[selectedIndex] });
      } else if (settingData.settingType === "repeat") {
        const options: Array<"off" | "one" | "all"> = ["off", "one", "all"];
        updateSettings({ repeat: options[selectedIndex] });
      } else if (settingData.settingType === "backlight") {
        const options = [0, 2, 5, 10, 15, 20];
        updateSettings({ backlightTimer: options[selectedIndex] });
      } else if (settingData.settingType === "clicker") {
        updateSettings({ clicker: selectedIndex === 0 });
      }
      return;
    }

    if (screenType !== "menu" || !selectedItem) return;

    const itemId = selectedItem.id;

    // Main menu
    if (itemId === "music") {
      navigateTo({
        screenType: "menu",
        screenId: "music",
        title: "Music",
        selectedIndex: 0,
      });
    } else if (itemId === "photos") {
      navigateTo({
        screenType: "menu",
        screenId: "photos",
        title: "Photos",
        selectedIndex: 0,
      });
    } else if (itemId === "extras") {
      navigateTo({
        screenType: "menu",
        screenId: "extras",
        title: "Extras",
        selectedIndex: 0,
      });
    } else if (itemId === "settings") {
      navigateTo({
        screenType: "menu",
        screenId: "settings",
        title: "Settings",
        selectedIndex: 0,
      });
    } else if (itemId === "shuffle") {
      shufflePlay();
      navigateTo({
        screenType: "nowPlaying",
        screenId: "nowPlaying",
        title: "Now Playing",
        selectedIndex: 0,
      });
    } else if (itemId === "nowPlaying") {
      navigateTo({
        screenType: "nowPlaying",
        screenId: "nowPlaying",
        title: "Now Playing",
        selectedIndex: 0,
      });
    }

    // Music submenu
    else if (itemId === "artists") {
      navigateTo({
        screenType: "menu",
        screenId: "artists",
        title: "Artists",
        selectedIndex: 0,
      });
    } else if (itemId === "albums") {
      navigateTo({
        screenType: "menu",
        screenId: "albums",
        title: "Albums",
        selectedIndex: 0,
      });
    } else if (itemId === "songs") {
      navigateTo({
        screenType: "menu",
        screenId: "songs",
        title: "Songs",
        selectedIndex: 0,
      });
    } else if (itemId === "genres") {
      navigateTo({
        screenType: "menu",
        screenId: "genres",
        title: "Genres",
        selectedIndex: 0,
      });
    } else if (itemId === "addMusic") {
      navigateTo({
        screenType: "musicUpload",
        screenId: "addMusic",
        title: "Add Music",
        selectedIndex: 0,
      });
    }

    // Artists (id format: artist-{name})
    else if (itemId.startsWith("artist-") && screenId === "artists") {
      const artistName = itemId.replace("artist-", "");
      navigateTo({
        screenType: "menu",
        screenId: itemId,
        title: artistName,
        selectedIndex: 0,
        data: { artistName },
      });
    }

    // Albums (id format: album-{title}-{artist})
    else if (itemId.startsWith("album-")) {
      const album = derivedAlbums.find(
        (a) => `album-${a.title}-${a.artist}` === itemId
      );
      if (album) {
        navigateTo({
          screenType: "menu",
          screenId: itemId,
          title: album.title,
          selectedIndex: 0,
          data: { albumTitle: album.title },
        });
      }
    }

    // Genres
    else if (itemId.startsWith("genre-")) {
      const genre = itemId.replace("genre-", "");
      navigateTo({
        screenType: "menu",
        screenId: itemId,
        title: genre,
        selectedIndex: 0,
        data: { genre },
      });
    }

    // Songs - play them
    else if (itemId.startsWith("song-")) {
      const songId = itemId.replace("song-", "");
      const song = allSongs.find((s) => s.id === songId);
      if (song) {
        // Get the current list of songs for the queue
        let queue: Song[] = [];

        if (screenId === "songs") {
          queue = allSongs;
        } else if (screenId.startsWith("album-")) {
          const albumTitle = (data as { albumTitle: string })?.albumTitle;
          queue = getSongsByAlbum(albumTitle);
        } else if (screenId.startsWith("genre-")) {
          const genre = (data as { genre: string })?.genre;
          queue = getSongsByGenre(genre);
        } else {
          queue = [song];
        }

        playSong(song, queue);
        navigateTo({
          screenType: "nowPlaying",
          screenId: "nowPlaying",
          title: "Now Playing",
          selectedIndex: 0,
        });
      }
    }

    // Photos
    else if (itemId === "photoLibrary") {
      setCurrentPhoto("pa1", 0);
      navigateTo({
        screenType: "photoViewer",
        screenId: "photoLibrary",
        title: "Photo Library",
        selectedIndex: 0,
        data: { albumId: "pa1" },
      });
    } else if (itemId.startsWith("photoAlbum-")) {
      const albumId = itemId.replace("photoAlbum-", "");
      navigateTo({
        screenType: "menu",
        screenId: itemId,
        title: photoAlbums.find((a) => a.id === albumId)?.name || "Album",
        selectedIndex: 0,
        data: { albumId },
      });
    } else if (itemId.startsWith("photo-")) {
      const photoData = data as { albumId: string };
      const photos = getPhotosByAlbum(photoData.albumId);
      const photoIndex = photos.findIndex((p) => `photo-${p.id}` === itemId);
      setCurrentPhoto(photoData.albumId, photoIndex >= 0 ? photoIndex : 0);
      navigateTo({
        screenType: "photoViewer",
        screenId: "photo",
        title: "Photo",
        selectedIndex: 0,
        data: { albumId: photoData.albumId },
      });
    }

    // Extras
    else if (itemId === "clock") {
      navigateTo({
        screenType: "clock",
        screenId: "clock",
        title: "Clock",
        selectedIndex: 0,
        data: { mode: "clock" },
      });
    } else if (itemId === "stopwatch") {
      navigateTo({
        screenType: "stopwatch",
        screenId: "stopwatch",
        title: "Stopwatch",
        selectedIndex: 0,
        data: { mode: "stopwatch" },
      });
    } else if (itemId === "timer") {
      navigateTo({
        screenType: "timer",
        screenId: "timer",
        title: "Timer",
        selectedIndex: 0,
        data: { mode: "timer" },
      });
    }

    // Settings
    else if (itemId === "about") {
      navigateTo({
        screenType: "settings",
        screenId: "about",
        title: "About",
        selectedIndex: 0,
        data: { settingType: "about" },
      });
    } else if (itemId === "settingShuffle") {
      const currentIndex = ["off", "songs", "albums"].indexOf(settings.shuffle);
      navigateTo({
        screenType: "settings",
        screenId: "shuffle",
        title: "Shuffle",
        selectedIndex: Math.max(0, currentIndex),
        data: { settingType: "shuffle" },
      });
    } else if (itemId === "settingRepeat") {
      const currentIndex = ["off", "one", "all"].indexOf(settings.repeat);
      navigateTo({
        screenType: "settings",
        screenId: "repeat",
        title: "Repeat",
        selectedIndex: Math.max(0, currentIndex),
        data: { settingType: "repeat" },
      });
    } else if (itemId === "settingBacklight") {
      const options = [0, 2, 5, 10, 15, 20];
      const currentIndex = options.indexOf(settings.backlightTimer);
      navigateTo({
        screenType: "settings",
        screenId: "backlight",
        title: "Backlight",
        selectedIndex: Math.max(0, currentIndex),
        data: { settingType: "backlight" },
      });
    } else if (itemId === "settingBrightness") {
      navigateTo({
        screenType: "settings",
        screenId: "brightness",
        title: "Brightness",
        selectedIndex: settings.brightness,
        data: { settingType: "brightness" },
      });
    } else if (itemId === "settingClicker") {
      navigateTo({
        screenType: "settings",
        screenId: "clicker",
        title: "Clicker",
        selectedIndex: settings.clicker ? 0 : 1,
        data: { settingType: "clicker" },
      });
    } else if (itemId === "resetSettings") {
      // Clear all music from IndexedDB and state
      musicDB.clearAll().then(() => {
        setUserSongs([]);
        setUserLibraryLoaded(false);
      });
    }
  }, [
    currentScreen,
    menuItems,
    selectedIndex,
    navigateTo,
    playSong,
    shufflePlay,
    settings,
    updateSettings,
    setCurrentPhoto,
    allSongs,
    derivedAlbums,
    getSongsByAlbum,
    getSongsByGenre,
  ]);

  // Render content based on screen type
  const renderContent = () => {
    const { screenType, data } = currentScreen;

    switch (screenType) {
      case "menu":
        return <MenuList items={menuItems} selectedIndex={selectedIndex} />;

      case "nowPlaying":
        return <NowPlaying />;

      case "photoViewer":
        const photoData = data as { albumId: string };
        return (
          <PhotoViewer
            albumId={photoData?.albumId || currentPhotoAlbumId || "pa1"}
            currentIndex={currentPhotoIndex}
          />
        );

      case "clock":
      case "stopwatch":
      case "timer":
        return <Clock mode={screenType} />;

      case "settings":
        const settingsData = data as { settingType: string };
        return (
          <Settings
            settingType={settingsData?.settingType || "about"}
            selectedIndex={selectedIndex}
          />
        );

      case "musicUpload":
        return <MusicUpload />;

      default:
        return <MenuList items={menuItems} selectedIndex={selectedIndex} />;
    }
  };

  // Calculate item count for wheel scrolling
  const getItemCount = () => {
    const { screenType, data } = currentScreen;

    if (screenType === "photoViewer") {
      const photoData = data as { albumId: string };
      return getPhotosByAlbum(photoData?.albumId || "pa1").length;
    }

    if (screenType === "settings") {
      const settingsData = data as { settingType: string };
      switch (settingsData?.settingType) {
        case "about":
          return 8; // name, songs, photos, capacity, available, version, s/n, format
        case "shuffle":
          return 3; // off, songs, albums
        case "repeat":
          return 3; // off, one, all
        case "backlight":
          return 6; // always on, 2s, 5s, 10s, 15s, 20s
        case "clicker":
          return 2; // on, off
        case "brightness":
          return 101; // 0-100
        default:
          return 1;
      }
    }

    return menuItems.length;
  };

  // Show boot screen
  if (isBooting) {
    return (
      <div className="ipod-container">
        <div className="ipod-shell">
          <div className="ipod-top-section">
            <div className="ipod-screen boot">
              <BootScreen onBootComplete={() => setIsBooting(false)} />
            </div>
          </div>
          <div className="ipod-bottom-section">
            <div className="click-wheel disabled">
              <div className="center-button" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <IPodShell onSelect={handleSelect} itemCount={getItemCount()}>
      {renderContent()}
    </IPodShell>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
