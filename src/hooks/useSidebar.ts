'use client';

import { useState } from 'react';

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return {
    isCollapsed,
    toggleSidebar,
    toggleCollapsed,
  };
} 