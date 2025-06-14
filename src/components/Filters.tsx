import React, { useState, useEffect } from 'react';
import { ChevronDown, Star, X } from 'lucide-react';
import { SearchFilters } from '../types';

interface FiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags
}) => {
  const [showTagFilter, setShowTagFilter] = useState(false);

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleTagToggle = (tag: string) => {
    const selectedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    
    onFiltersChange({ ...filters, selectedTags });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating === filters.minRating ? 0 : rating });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      selectedTags: [],
      sortBy: 'newest',
      minRating: 0
    });
  };

  const hasActiveFilters = filters.selectedTags.length > 0 || filters.minRating > 0;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/30 dark:border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/30 text-gray-900 dark:text-white backdrop-blur-sm cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A-Z</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Recently Updated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Min Rating:</span>
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`p-1 rounded-lg transition-all ${
                  filters.minRating >= rating
                    ? 'text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTagFilter(!showTagFilter)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/30 text-gray-900 dark:text-white backdrop-blur-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all text-sm"
            >
              <span>Tags</span>
              {filters.selectedTags.length > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1">
                  {filters.selectedTags.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showTagFilter && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-64 overflow-y-auto rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="p-4">
                  {availableTags.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No tags available</p>
                  ) : (
                    <div className="space-y-2">
                      {availableTags.map(tag => (
                        <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.selectedTags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{tag}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          {/* Active Tag Chips */}
          {filters.selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.selectedTags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};