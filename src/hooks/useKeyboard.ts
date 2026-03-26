import { useEffect, useRef } from 'react';

export const useKeyboard = () => {
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) keys.current.MouseLeft = true;
      if (e.button === 2) keys.current.MouseRight = true;
      if (e.button === 1) keys.current.MouseMiddle = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) keys.current.MouseLeft = false;
      if (e.button === 2) keys.current.MouseRight = false;
      if (e.button === 1) keys.current.MouseMiddle = false;
    };
    const suppressContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', suppressContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', suppressContextMenu);
    };
  }, []);

  return keys;
};
