import React, { useEffect, useCallback } from 'react';
import type { JournalModalProps } from '../types/props';
import SwipeNavigator from './SwipeNavigator';

const JournalModal: React.FC<JournalModalProps> = ({
  entries,
  currentIndex,
  onClose,
  onNavigate
}) => {
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long'
    });
  };

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
      {/* Modal container */}
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all hover:scale-110"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* SwipeNavigator wrapper */}
        <SwipeNavigator
          currentIndex={currentIndex}
          total={entries.length}
          onNavigate={onNavigate}
        >
          {/* Journal Entry Card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out transform hover:scale-[1.02]">
              {/* Image section */}
              <div className="relative h-80 bg-gray-100">
                <img
                  src={entries[currentIndex].imgUrl}
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
                  <h2 className="text-2xl font-bold text-gray-900">{formatDate(entries[currentIndex].date)}</h2>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(entries[currentIndex].rating) 
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
                  {entries[currentIndex].categories.map((category, index) => {
                    const getIcon = (cat: string) => {
                      const lowerCat = category.toLowerCase();
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
                  {entries[currentIndex].description}
                </p>

                {/* Browse all entries info */}
                

                {/* View Full Post button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors hover:bg-gray-200"
                >
                  View Full Post 
                </button>
              </div>
            </div>
          </div>
        </SwipeNavigator>
      </div>
    </div>
  );
};

export default JournalModal;