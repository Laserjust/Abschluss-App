import { useState, useEffect } from 'react';

/**
 * Custom Hook für dynamische Responsivität
 * Überwacht Viewport-Änderungen und passt Layout automatisch an
 */
export const useResponsive = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 600,
    isTablet: window.innerWidth >= 600 && window.innerWidth < 960,
    isDesktop: window.innerWidth >= 960,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  });

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let resizeTimer;
    let rafId;

    const updateViewport = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setViewport({
        width: newWidth,
        height: newHeight,
        isMobile: newWidth < 600,
        isTablet: newWidth >= 600 && newWidth < 960,
        isDesktop: newWidth >= 960,
        orientation: newWidth > newHeight ? 'landscape' : 'portrait'
      });
    };

    const handleResize = () => {
      // Sofortige Aktualisierung für bessere Responsivität
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        updateViewport();
        setIsResizing(true);
      });
      
      // Debounce nur für das Resizing-Flag
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsResizing(false);
      }, 100);
    };

    // Event Listener hinzufügen
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimer);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Hilfsfunktionen für responsive Breakpoints
  const getGridCols = () => {
    if (viewport.isMobile) return 1;
    if (viewport.isTablet) return 2;
    return viewport.width > 1200 ? 4 : 3;
  };

  const getCardWidth = () => {
    if (viewport.isMobile) return '100%';
    if (viewport.isTablet) return 'calc(50% - 8px)';
    return viewport.width > 1200 ? 'calc(25% - 12px)' : 'calc(33.333% - 10px)';
  };

  const getPadding = () => {
    if (viewport.isMobile) return '8px';
    if (viewport.isTablet) return '12px';
    return '16px';
  };

  const getGap = () => {
    if (viewport.isMobile) return '8px';
    if (viewport.isTablet) return '12px';
    return '16px';
  };

  return {
    viewport,
    isResizing,
    getGridCols,
    getCardWidth,
    getPadding,
    getGap
  };
};

/**
 * Hook für dynamische Container-Größen
 */
export const useContainerQuery = (ref) => {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  const getContainerCols = () => {
    if (containerWidth < 400) return 1;
    if (containerWidth < 800) return 2;
    if (containerWidth < 1200) return 3;
    return 4;
  };

  return {
    containerWidth,
    getContainerCols
  };
};

export default useResponsive;