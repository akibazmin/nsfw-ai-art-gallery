import React, { useState, useEffect } from 'react';
import { X, Download, Edit3, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageMetadata } from '../types';
import { StarRating } from './StarRating';
import { parseTags } from '../utils/imageUtils';

interface ImageModalProps {
  image: ImageMetadata;
  images: ImageMetadata[];
  onClose: () => void;
  onUpdate: (image: ImageMetadata) => void;
  onDelete: (id: string) => void;
  onNavigate: (image: ImageMetadata) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  image,
  images,
  onClose,
  onUpdate,
  onDelete,
  onNavigate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<ImageMetadata>({ ...image });

  const currentIndex = images.findIndex(img => img.id === image.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  useEffect(() => {
    setEditedImage({ ...image });
  }, [image]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (hasPrevious) {
            onNavigate(images[currentIndex - 1]);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (hasNext) {
            onNavigate(images[currentIndex + 1]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrevious, hasNext, images, onNavigate, onClose, isEditing]);

  const handleSave = () => {
    onUpdate(editedImage);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedImage({ ...image });
    setIsEditing(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDelete(image.id);
      onClose();
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(images[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(images[currentIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Navigation Arrows */}
      {hasPrevious && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden mx-4 border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {image.filename}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} of {images.length}
            </span>
            <StarRating
              rating={isEditing ? editedImage.rating : image.rating}
              onRatingChange={isEditing ? (rating) => setEditedImage(prev => ({ ...prev, rating })) : undefined}
              readonly={!isEditing}
            />
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(95vh-100px)]">
          {/* Image */}
          <div className="bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-6">
            <img
              src={image.url}
              alt={image.filename}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          </div>

          {/* Metadata */}
          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt
                </label>
                {isEditing ? (
                  <textarea
                    value={editedImage.prompt || ''}
                    onChange={(e) => setEditedImage(prev => ({ ...prev, prompt: e.target.value }))}
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                ) : (
                  <div className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white min-h-[100px]">
                    {image.prompt || 'N/A'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Negative Prompt
                </label>
                {isEditing ? (
                  <textarea
                    value={editedImage.negativePrompt || ''}
                    onChange={(e) => setEditedImage(prev => ({ ...prev, negativePrompt: e.target.value }))}
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white min-h-[80px]">
                    {image.negativePrompt || 'N/A'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seed
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedImage.seed || ''}
                    onChange={(e) => setEditedImage(prev => ({ ...prev, seed: e.target.value }))}
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white">
                    {image.seed || 'N/A'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedImage.tags.join(', ')}
                    onChange={(e) => setEditedImage(prev => ({ ...prev, tags: parseTags(e.target.value) }))}
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80">
                    {image.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {image.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">No tags</span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Added
                  </label>
                  <div className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-sm">
                    {image.dateAdded.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Modified
                  </label>
                  <div className="p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-sm">
                    {image.lastModified.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};