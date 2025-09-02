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

  // Prevent rendering if no entries
  if (!entries.length) {
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
      <div className="relative w-full max-w-6xl mx-auto h-full max-h-[90vh]">
        {/* Header with close button */}
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all hover:scale-110 z-10"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* SwipeNavigator wrapper */}
        <SwipeNavigator
          currentIndex={currentIndex}
          total={entries.length}
          onNavigate={onNavigate}
        >
          {/* Main centered card - matching the image design */}
          <div className="w-full max-w-sm mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out transform hover:scale-[1.02]">
              {/* Image section */}
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={entries[currentIndex].imgUrl}
                  alt="Journal entry"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>

              {/* Content section */}
              <div className="p-6">
                {/* Categories with colored backgrounds */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {entries[currentIndex].categories.map((category, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                        index === 0 ? 'bg-blue-100 text-blue-800' :
                        index === 1 ? 'bg-purple-100 text-purple-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category}
                    </span>
                  ))}
                </div>

                {/* Rating stars */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(entries[currentIndex].rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Date */}
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {formatDate(entries[currentIndex].date)}
                </h2>

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-3">
                  {entries[currentIndex].description}
                </p>

                {/* View Full Post button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  View full Post
                </button>
              </div>
            </div>
          </div>
        </SwipeNavigator>

        {/* Side cards layout */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {/* Previous card (left side) */}
            {currentIndex > 0 && (
              <div className="transform -translate-x-20 opacity-60 scale-75 pointer-events-none">
                <div className="w-72 bg-white rounded-3xl shadow-xl overflow-hidden">
                  {/* Image section */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img
                      src={entries[currentIndex - 1].imgUrl}
                      alt="Journal entry"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  {/* Content section */}
                  <div className="p-4">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entries[currentIndex - 1].categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                            index === 0 ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(entries[currentIndex - 1].rating) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {formatDate(entries[currentIndex - 1].date)}
                    </h3>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {entries[currentIndex - 1].description}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Current card placeholder (invisible, just for spacing) */}
            <div className="w-80 opacity-0 pointer-events-none"></div>
            
            {/* Next card (right side) */}
            {currentIndex < entries.length - 1 && (
              <div className="transform translate-x-20 opacity-60 scale-75 pointer-events-none">
                <div className="w-72 bg-white rounded-3xl shadow-xl overflow-hidden">
                  {/* Image section */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img
                      src={entries[currentIndex + 1].imgUrl}
                      alt="Journal entry"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  {/* Content section */}
                  <div className="p-4">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entries[currentIndex + 1].categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                            index === 0 ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(entries[currentIndex + 1].rating) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {formatDate(entries[currentIndex + 1].date)}
                    </h3>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {entries[currentIndex + 1].description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalModal;