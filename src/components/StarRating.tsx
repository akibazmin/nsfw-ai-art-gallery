import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`transition-all ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${
            star <= rating
              ? 'text-yellow-500'
              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
          }`}
        >
          <Star className={`${sizeClasses[size]} fill-current`} />
        </button>
      ))}
    </div>
  );
};