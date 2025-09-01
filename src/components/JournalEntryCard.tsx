import React from 'react';
import type { JournalEntryCardProps } from '../types/props';

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
  const { imgUrl, rating, categories, date, description } = entry;
  
  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA3NUgxMjVWMTI1SDc1Vjc1WiIgZmlsbD0iI0Q0RDRENyIvPgo8L3N2Zz4K';
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Image section - more compact */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={imgUrl}
          alt="Journal entry"
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Date overlay */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full">
          <span className="text-xs font-medium">
            {displayDate}
          </span>
        </div>
        
        {/* Rating overlay */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-xs ${
                  i < Math.floor(rating) 
                    ? 'text-yellow-500' 
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
            <span className="text-xs font-medium text-gray-700 ml-1">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content section - more compact */}
      <div className="p-4 sm:p-5">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900">
            Journal Entry
          </h3>
          <p className="text-gray-700 leading-relaxed text-sm">
            {description}
          </p>
        </div>
        
        {/* Entry metadata */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </span>
            <span>
              Rating: {rating}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryCard;