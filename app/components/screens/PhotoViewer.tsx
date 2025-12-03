"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getPhotosByAlbum } from "../../data/mockData";

interface PhotoViewerProps {
  albumId: string;
  currentIndex: number;
}

export default function PhotoViewer({
  albumId,
  currentIndex,
}: PhotoViewerProps) {
  const photos = getPhotosByAlbum(albumId);
  const safeIndex = Math.min(Math.max(0, currentIndex), photos.length - 1);
  const photo = photos[safeIndex];

  if (!photo || photos.length === 0) {
    return (
      <div className="photo-viewer empty">
        <p>No photos</p>
      </div>
    );
  }

  return (
    <div className="photo-viewer">
      <AnimatePresence mode="wait">
        <motion.div
          key={photo.id}
          className="photo-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          <img src={photo.src} alt={photo.name} className="photo-image" />
        </motion.div>
      </AnimatePresence>

      <div className="photo-info">
        <span className="photo-name">{photo.name}</span>
        <span className="photo-count">
          {safeIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Navigation hint */}
      <div className="photo-nav-hint">
        <span className="nav-arrow">‹</span>
        <span className="nav-text">Use wheel</span>
        <span className="nav-arrow">›</span>
      </div>
    </div>
  );
}
