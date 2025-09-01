import React, { useEffect, useCallback, useState } from 'react';
import type { JournalModalProps } from '../types/props';

const JournalModal: React.FC<JournalModalProps> = ({
  entries,
  currentIndex,
  onClose,
  onNavigate
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const currentEntry = entries[currentIndex];
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      onNavigate(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < entries.length - 1) {
      e.preventDefault();
      onNavigate(currentIndex + 1);
    }
  }, [onClose, currentIndex, entries.length, onNavigate]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < entries.length - 1) {
      onNavigate(currentIndex + 1);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  // Format date for display
  const displayDate = new Date(currentEntry.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long'
  });

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUgxMjVWMTI1SDc1Vjc1WiIgZmlsbD0iI0Q0RDRENyIvPgo8L3N2Zz4K';
  };

  // Prevent rendering if no entries or invalid index
  if (!entries.length || currentIndex < 0 || currentIndex >= entries.length) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-modal-title"
    >
      {/* Modal container - long card design */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image section */}
        <div className="relative h-80 bg-gray-100">
          <img
            src={currentEntry.imgUrl}
            alt="Journal entry"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Content section */}
        <div className="p-6">
          {/* Date and rating row */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{displayDate}</h2>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < Math.floor(currentEntry.rating) 
                      ? 'text-blue-500' 
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentEntry.categories.map((category, index) => {
              // Icon mapping for categories
              const getIcon = (cat: string) => {
                const lowerCat = cat.toLowerCase();
                if (lowerCat.includes('moisture') || lowerCat.includes('hydration')) return '💧';
                if (lowerCat.includes('protein')) return '🥚';
                if (lowerCat.includes('oil')) return '🫧';
                if (lowerCat.includes('growth')) return '🌱';
                if (lowerCat.includes('repair')) return '🔧';
                if (lowerCat.includes('style') || lowerCat.includes('braid')) return '✨';
                if (lowerCat.includes('wash')) return '🚿';
                if (lowerCat.includes('color')) return '🎨';
                return '📝';
              };
              
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full"
                >
                  <span>{getIcon(category)}</span>
                  <span>{category}</span>
                </span>
              );
            })}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">
            {currentEntry.description}
          </p>

          {/* Navigation dots and View Full Post button */}
          <div className="space-y-4">
            {/* Navigation dots for multiple entries */}
            {entries.length > 1 && (
              <div className="flex items-center justify-center space-x-2">
                {entries.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onNavigate(index)}
                    className={`transition-all duration-200 ${
                      index === currentIndex 
                        ? 'w-8 h-2 bg-blue-500 rounded-full' 
                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                    aria-label={`Go to entry ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* View Full Post button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              View Full Post
            </button>
          </div>
        </div>

        {/* Navigation arrows for desktop */}
        {entries.length > 1 && (
          <>
            <button
              onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hidden sm:flex ${
                currentIndex === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-opacity-100 hover:scale-110'
              }`}
              aria-label="Previous entry"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => currentIndex < entries.length - 1 && onNavigate(currentIndex + 1)}
              disabled={currentIndex === entries.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hidden sm:flex ${
                currentIndex === entries.length - 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-opacity-100 hover:scale-110'
              }`}
              aria-label="Next entry"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JournalModal;