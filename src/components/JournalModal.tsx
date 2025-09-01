import React, { useEffect, useCallback, useState } from 'react';
import type { JournalModalProps } from '../types/props';

// Add custom CSS animations for smooth transitions
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

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

  // Set up keyboard listeners and inject styles
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Inject custom styles for smooth animations
    const styleElement = document.createElement('style');
    styleElement.textContent = modalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.head.removeChild(styleElement);
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
      // Add a small delay for smoother transition
      setTimeout(() => onNavigate(currentIndex + 1), 50);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      // Add a small delay for smoother transition
      setTimeout(() => onNavigate(currentIndex - 1), 50);
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
      {/* Modal container - carousel design with multiple cards */}
      <div className="relative w-full max-w-7xl">
        {/* Mobile view - single card */}
        <div className="lg:hidden relative w-full max-w-md mx-auto">
          <div 
            key={`mobile-${currentIndex}`}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out animate-fadeIn"
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
                  const getIcon = (cat: string) => {
                    const lowerCat = cat.toLowerCase();
                    if (lowerCat.includes('moisture') || lowerCat.includes('hydration')) return '💧';
                    if (lowerCat.includes('protein')) return '🥚';
                    if (lowerCat.includes('oil')) return '🫧';
                    if (lowerCat.includes('growth')) return '🌱';
                    if (lowerCat.includes('repair')) return '🔧';
                    if (lowerCat.includes('style') || lowerCat.includes('braid')) return '✨';
                    if (lowerCat.includes('wash')) return '🛿';
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
                        className={`transition-all duration-300 ease-out transform hover:scale-110 ${
                          index === currentIndex 
                            ? 'w-8 h-2 bg-blue-500 rounded-full shadow-lg' 
                            : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400 hover:scale-110'
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
          </div>
        </div>

        {/* Desktop carousel view */}
        <div className="hidden lg:block relative w-full">
          <div className="flex items-center justify-center">
            {/* Previous entry preview (if exists) */}
            {currentIndex > 0 && (
              <div 
                className="absolute left-0 w-80 transform scale-90 opacity-50 hover:opacity-75 transition-all duration-300 cursor-pointer z-0"
                onClick={() => onNavigate(currentIndex - 1)}
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={entries[currentIndex - 1].imgUrl}
                      alt="Previous entry"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {new Date(entries[currentIndex - 1].date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {entries[currentIndex - 1].description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next entry preview (if exists) */}
            {currentIndex < entries.length - 1 && (
              <div 
                className="absolute right-0 w-80 transform scale-90 opacity-50 hover:opacity-75 transition-all duration-300 cursor-pointer z-0"
                onClick={() => onNavigate(currentIndex + 1)}
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={entries[currentIndex + 1].imgUrl}
                      alt="Next entry"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {new Date(entries[currentIndex + 1].date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {entries[currentIndex + 1].description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main current entry card */}
            <div 
              key={`desktop-${currentIndex}`}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 mx-auto transition-all duration-300 ease-out animate-fadeIn"
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
                          className={`transition-all duration-300 ease-out transform hover:scale-110 ${
                            index === currentIndex 
                              ? 'w-8 h-2 bg-blue-500 rounded-full shadow-lg' 
                              : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400 hover:scale-110'
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
            </div>
          </div>
        </div>

        {/* Navigation arrows for mobile/tablet */}
        {entries.length > 1 && (
          <>
            <button
              onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={`absolute left-2 lg:left-80 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all flex lg:hidden ${
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
              className={`absolute right-2 lg:right-80 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all flex lg:hidden ${
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