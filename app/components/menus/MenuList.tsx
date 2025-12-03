'use client';

import { useRef, useEffect } from 'react';
import MenuItem from './MenuItem';

export interface MenuItemData {
  id: string;
  label: string;
  hasSubmenu?: boolean;
  rightText?: string;
}

interface MenuListProps {
  items: MenuItemData[];
  selectedIndex: number;
}

export default function MenuList({ items, selectedIndex }: MenuListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex];
    if (selectedItem && listRef.current) {
      const container = listRef.current;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      
      if (itemTop < containerTop) {
        container.scrollTop = itemTop;
      } else if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.clientHeight;
      }
    }
  }, [selectedIndex]);
  
  return (
    <div className="menu-list" ref={listRef}>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => { itemRefs.current[index] = el; }}
        >
          <MenuItem
            label={item.label}
            isSelected={index === selectedIndex}
            hasSubmenu={item.hasSubmenu}
            rightText={item.rightText}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}

