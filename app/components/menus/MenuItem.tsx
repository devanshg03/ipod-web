'use client';

import { motion } from 'framer-motion';

interface MenuItemProps {
  label: string;
  isSelected: boolean;
  hasSubmenu?: boolean;
  rightText?: string;
  index: number;
}

export default function MenuItem({ 
  label, 
  isSelected, 
  hasSubmenu = false,
  rightText,
  index,
}: MenuItemProps) {
  return (
    <motion.div
      className={`menu-item ${isSelected ? 'selected' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
    >
      <span className="menu-item-label">{label}</span>
      <span className="menu-item-right">
        {rightText && <span className="menu-item-value">{rightText}</span>}
        {hasSubmenu && <span className="menu-item-arrow">›</span>}
      </span>
    </motion.div>
  );
}

