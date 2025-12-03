"use client";

import { useEffect, useRef } from "react";
import { useIPodStore } from "../../store/iPodStore";
import { photos } from "../../data/mockData";
import MenuList, { MenuItemData } from "../menus/MenuList";

interface SettingsProps {
  settingType: string;
  selectedIndex: number;
}

export default function Settings({
  settingType,
  selectedIndex,
}: SettingsProps) {
  const { settings, updateSettings, userSongs } = useIPodStore();
  const isInitialMount = useRef(true);

  // Sync brightness value when wheel scrolls
  useEffect(() => {
    if (settingType === "brightness") {
      // Skip the initial mount to avoid resetting to 0
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      // Clamp selectedIndex to valid brightness range
      const newBrightness = Math.max(0, Math.min(100, selectedIndex));
      if (newBrightness !== settings.brightness) {
        updateSettings({ brightness: newBrightness });
      }
    }
  }, [settingType, selectedIndex, settings.brightness, updateSettings]);

  if (settingType === "about") {
    const songsCount = userSongs.length;
    const photosCount = photos.length;

    const items: MenuItemData[] = [
      { id: "name", label: "Name", rightText: "iPod Web" },
      { id: "songs", label: "Songs", rightText: String(songsCount) },
      { id: "photos", label: "Photos", rightText: String(photosCount) },
      { id: "capacity", label: "Capacity", rightText: "∞" },
      { id: "available", label: "Available", rightText: "∞" },
      { id: "version", label: "Version", rightText: "1.0.0" },
      { id: "serial", label: "S/N", rightText: "WEBIPOD2024" },
      { id: "format", label: "Format", rightText: "Next.js" },
    ];
    return <MenuList items={items} selectedIndex={selectedIndex} />;
  }

  if (settingType === "shuffle") {
    const items: MenuItemData[] = [
      {
        id: "off",
        label: "Off",
        rightText: settings.shuffle === "off" ? "✓" : "",
      },
      {
        id: "songs",
        label: "Songs",
        rightText: settings.shuffle === "songs" ? "✓" : "",
      },
      {
        id: "albums",
        label: "Albums",
        rightText: settings.shuffle === "albums" ? "✓" : "",
      },
    ];
    return <MenuList items={items} selectedIndex={selectedIndex} />;
  }

  if (settingType === "repeat") {
    const items: MenuItemData[] = [
      {
        id: "off",
        label: "Off",
        rightText: settings.repeat === "off" ? "✓" : "",
      },
      {
        id: "one",
        label: "One",
        rightText: settings.repeat === "one" ? "✓" : "",
      },
      {
        id: "all",
        label: "All",
        rightText: settings.repeat === "all" ? "✓" : "",
      },
    ];
    return <MenuList items={items} selectedIndex={selectedIndex} />;
  }

  if (settingType === "backlight") {
    const items: MenuItemData[] = [
      {
        id: "0",
        label: "Always On",
        rightText: settings.backlightTimer === 0 ? "✓" : "",
      },
      {
        id: "2",
        label: "2 Seconds",
        rightText: settings.backlightTimer === 2 ? "✓" : "",
      },
      {
        id: "5",
        label: "5 Seconds",
        rightText: settings.backlightTimer === 5 ? "✓" : "",
      },
      {
        id: "10",
        label: "10 Seconds",
        rightText: settings.backlightTimer === 10 ? "✓" : "",
      },
      {
        id: "15",
        label: "15 Seconds",
        rightText: settings.backlightTimer === 15 ? "✓" : "",
      },
      {
        id: "20",
        label: "20 Seconds",
        rightText: settings.backlightTimer === 20 ? "✓" : "",
      },
    ];
    return <MenuList items={items} selectedIndex={selectedIndex} />;
  }

  if (settingType === "brightness") {
    // selectedIndex is used as the brightness value (0-100)
    // We show selectedIndex as the current adjustment level
    const displayBrightness = selectedIndex;

    return (
      <div className="brightness-screen">
        <div className="brightness-control">
          {/* Dim sun icon */}
          <svg
            className="brightness-icon dim"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Slider track */}
          <div className="brightness-slider">
            <div className="brightness-track">
              <div
                className="brightness-fill"
                style={{ width: `${displayBrightness}%` }}
              />
              <div
                className="brightness-thumb"
                style={{ left: `${displayBrightness}%` }}
              />
            </div>
          </div>

          {/* Bright sun icon */}
          <svg
            className="brightness-icon bright"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="5" />
            <path
              d="M12 1v3M12 20v3M3.51 3.51l2.12 2.12M18.37 18.37l2.12 2.12M1 12h3M20 12h3M3.51 20.49l2.12-2.12M18.37 5.63l2.12-2.12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (settingType === "clicker") {
    const items: MenuItemData[] = [
      { id: "on", label: "On", rightText: settings.clicker ? "✓" : "" },
      { id: "off", label: "Off", rightText: !settings.clicker ? "✓" : "" },
    ];
    return <MenuList items={items} selectedIndex={selectedIndex} />;
  }

  return null;
}
