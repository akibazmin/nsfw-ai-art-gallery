import React, { useState, useEffect } from 'react';
import { ImageModal } from './ImageModal';
import { StarRating } from './StarRating';
import { ImageMetadata } from '../types';

interface GalleryProps {
  images: ImageMetadata[];
  onImageUpdate: (image: ImageMetadata) => void;
  onImageDelete: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({
  images,
  onImageUpdate,
  onImageDelete
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setColumnCount(1);
      else if (width < 1024) setColumnCount(2);
      else if (width < 1280) setColumnCount(3);
      else setColumnCount(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageNavigate = (image: ImageMetadata) => {
    setSelectedImage(image);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6">
          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No images yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Upload your first images to start building your archive. All your photos and metadata will be stored locally on your device.
        </p>
      </div>
    );
  }

  // Create columns for masonry layout
  const columns: ImageMetadata[][] = Array(columnCount).fill(null).map(() => []);
  
  images.forEach((image, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(image);
  });

  return (
    <>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {column.map(image => (
              <div
                key={image.id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Rating */}
                  {image.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-2xl px-3 py-1">
                      <StarRating rating={image.rating} readonly size="sm" />
                    </div>
                  )}
                  
                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="text-white">
                      <h3 className="font-semibold text-sm truncate mb-1">
                        {image.filename}
                      </h3>
                      {image.prompt && (
                        <p className="text-xs text-gray-200 line-clamp-2">
                          {image.prompt}
                        </p>
                      )}
                      {image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {image.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {image.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full">
                              +{image.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          images={images}
          onClose={() => setSelectedImage(null)}
          onUpdate={onImageUpdate}
          onDelete={onImageDelete}
          onNavigate={handleImageNavigate}
        />
      )}
    </>
  );
};