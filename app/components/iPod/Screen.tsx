'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBar from './StatusBar';
import { useIPodStore } from '../../store/iPodStore';

interface ScreenProps {
  children: ReactNode;
}

export default function Screen({ children }: ScreenProps) {
  const { currentScreen, settings, backlightOn } = useIPodStore();
  
  return (
    <div 
      className={`ipod-screen ${!backlightOn ? 'dimmed' : ''}`}
      style={{
        filter: `brightness(${backlightOn ? (settings.brightness / 100 + 0.2) : 0.3})`,
        transition: 'filter 0.5s ease-in-out',
      }}
    >
      <StatusBar title={currentScreen.title} />
      
      <div className="screen-content">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentScreen.screenId}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="screen-inner"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Backlight off overlay */}
      {!backlightOn && (
        <div className="backlight-off-overlay" />
      )}
    </div>
  );
}
