import React, { useState, useCallback } from 'react';
import { Upload, X, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { ImageMetadata } from '../types';
import { createImageFromFile, parseTags } from '../utils/imageUtils';
import { StarRating } from './StarRating';

interface UploadZoneProps {
  onImagesUploaded: (images: ImageMetadata[]) => void;
  onClose: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImagesUploaded, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImageMetadata[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bulkMetadata, setBulkMetadata] = useState({
    prompt: '',
    negativePrompt: '',
    seed: '',
    tags: '',
    rating: 0
  });
  const [useBulkMetadata, setUseBulkMetadata] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      const imagePromises = files.map(createImageFromFile);
      const images = await Promise.all(imagePromises);
      setPendingImages(images);
      setCurrentImageIndex(0);
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );

      if (files.length > 0) {
        const imagePromises = files.map(createImageFromFile);
        const images = await Promise.all(imagePromises);
        setPendingImages(images);
        setCurrentImageIndex(0);
      }
    }
  }, []);

  const updateCurrentImage = (updates: Partial<ImageMetadata>) => {
    setPendingImages(prev => prev.map((img, index) => 
      index === currentImageIndex ? { ...img, ...updates } : img
    ));
  };

  const applyBulkMetadata = () => {
    const metadata = {
      prompt: bulkMetadata.prompt,
      negativePrompt: bulkMetadata.negativePrompt,
      seed: bulkMetadata.seed,
      tags: parseTags(bulkMetadata.tags),
      rating: bulkMetadata.rating
    };

    setPendingImages(prev => prev.map(img => ({ ...img, ...metadata })));
  };

  const handleNext = () => {
    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      // All images processed, upload them
      onImagesUploaded(pendingImages);
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleFinish = () => {
    onImagesUploaded(pendingImages);
    onClose();
  };

  const currentImage = pendingImages[currentImageIndex];

  if (pendingImages.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full mx-4 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Images</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Drop images here
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Or click to select files from your computer
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Select Images</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Metadata
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Image {currentImageIndex + 1} of {pendingImages.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {pendingImages.length > 1 && (
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={useBulkMetadata}
                    onChange={(e) => setUseBulkMetadata(e.target.checked)}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span>Bulk edit</span>
                </label>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {useBulkMetadata ? (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Bulk edit mode: These settings will be applied to all {pendingImages.length} images.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={bulkMetadata.prompt}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Enter the AI prompt used..."
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Negative Prompt
                  </label>
                  <textarea
                    value={bulkMetadata.negativePrompt}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, negativePrompt: e.target.value }))}
                    placeholder="Enter negative prompt..."
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seed
                  </label>
                  <input
                    type="text"
                    value={bulkMetadata.seed}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, seed: e.target.value }))}
                    placeholder="Enter seed value..."
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={bulkMetadata.tags}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas..."
                    className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <StarRating
                    rating={bulkMetadata.rating}
                    onRatingChange={(rating) => setBulkMetadata(prev => ({ ...prev, rating }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={applyBulkMetadata}
                className="flex-1 px-6 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
              >
                Apply to All Images
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Finish Upload
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="space-y-4">
              <img
                src={currentImage.url}
                alt={currentImage.filename}
                className="w-full h-64 object-cover rounded-2xl"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {currentImage.filename}
              </p>
            </div>

            {/* Metadata Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt
                </label>
                <textarea
                  value={currentImage.prompt || ''}
                  onChange={(e) => updateCurrentImage({ prompt: e.target.value })}
                  placeholder="Enter the AI prompt used..."
                  className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Negative Prompt
                </label>
                <textarea
                  value={currentImage.negativePrompt || ''}
                  onChange={(e) => updateCurrentImage({ negativePrompt: e.target.value })}
                  placeholder="Enter negative prompt..."
                  className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seed
                </label>
                <input
                  type="text"
                  value={currentImage.seed || ''}
                  onChange={(e) => updateCurrentImage({ seed: e.target.value })}
                  placeholder="Enter seed value..."
                  className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={currentImage.tags.join(', ')}
                  onChange={(e) => updateCurrentImage({ tags: parseTags(e.target.value) })}
                  placeholder="Enter tags separated by commas..."
                  className="w-full p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating
                  rating={currentImage.rating}
                  onRatingChange={(rating) => updateCurrentImage({ rating })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
                <button
                  onClick={handleSkip}
                  className="flex-1 px-6 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  <span>{currentImageIndex < pendingImages.length - 1 ? 'Next' : 'Finish'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};