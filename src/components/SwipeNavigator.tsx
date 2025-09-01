import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { SwipeNavigatorProps } from '../types/props';

const SwipeNavigator: React.FC<SwipeNavigatorProps> = ({
  currentIndex,
  total,
  onNavigate,
  children
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'h': // Vim-style
        e.preventDefault();
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
      case 'l': // Vim-style
        e.preventDefault();
        if (currentIndex < total - 1) {
          onNavigate(currentIndex + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        onNavigate(0);
        break;
      case 'End':
        e.preventDefault();
        onNavigate(total - 1);
        break;
    }
  }, [currentIndex, total, onNavigate]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end and detect swipe
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < total - 1) {
      onNavigate(currentIndex + 1);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navigation handlers
  const goToPrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < total - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < total) {
      onNavigate(index);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-4 flex items-center z-10">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`
            w-10 h-10 rounded-full bg-black bg-opacity-50 text-white
            flex items-center justify-center transition-all duration-200
            ${currentIndex === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-opacity-70 active:scale-95'
            }
          `}
          aria-label="Previous entry"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center z-10">
        <button
          onClick={goToNext}
          disabled={currentIndex === total - 1}
          className={`
            w-10 h-10 rounded-full bg-black bg-opacity-50 text-white
            flex items-center justify-center transition-all duration-200
            ${currentIndex === total - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-opacity-70 active:scale-95'
            }
          `}
          aria-label="Next entry"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-2 bg-black bg-opacity-50 px-4 py-2 rounded-full">
          {/* Current position */}
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {total}
          </span>
          
          {/* Dot indicators (max 7 dots for mobile) */}
          {total <= 7 ? (
            <div className="flex items-center space-x-1 ml-2">
              {[...Array(total)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-200
                    ${index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                    }
                  `}
                  aria-label={`Go to entry ${index + 1}`}
                />
              ))}
            </div>
          ) : (
            // Progress bar for many entries
            <div className="w-20 h-1 bg-white bg-opacity-30 rounded-full ml-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${((currentIndex + 1) / total) * 100}%`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Swipe hint (only show on first load) */}
      {total > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
            Swipe or use ← → keys to navigate
          </div>
        </div>
      )}

      {/* Render children content */}
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default SwipeNavigator;