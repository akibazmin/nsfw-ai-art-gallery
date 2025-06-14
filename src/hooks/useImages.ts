import { useState, useEffect, useCallback } from 'react';
import { ImageMetadata, SearchFilters } from '../types';
import { imageStorage } from '../utils/storage';

export const useImages = () => {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize storage first
      await imageStorage.init();
      
      // Then load images
      const loadedImages = await imageStorage.getAllImages();
      setImages(loadedImages);
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
      // Don't keep loading state if there's an error
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addImage = useCallback(async (metadata: ImageMetadata) => {
    try {
      setError(null);
      await imageStorage.saveImage(metadata);
      setImages(prev => [metadata, ...prev]);
    } catch (err) {
      console.error('Error adding image:', err);
      setError(err instanceof Error ? err.message : 'Failed to save image');
    }
  }, []);

  const updateImage = useCallback(async (metadata: ImageMetadata) => {
    try {
      setError(null);
      await imageStorage.updateImage(metadata);
      setImages(prev => prev.map(img => img.id === metadata.id ? metadata : img));
    } catch (err) {
      console.error('Error updating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to update image');
    }
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    try {
      setError(null);
      await imageStorage.deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  }, []);

  const filterImages = useCallback((filters: SearchFilters): ImageMetadata[] => {
    let filtered = [...images];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(img =>
        img.filename.toLowerCase().includes(query) ||
        img.prompt?.toLowerCase().includes(query) ||
        img.negativePrompt?.toLowerCase().includes(query) ||
        img.seed?.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(img =>
        filters.selectedTags.every(tag => img.tags.includes(tag))
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(img => img.rating >= filters.minRating);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'oldest':
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case 'alphabetical':
          return a.filename.localeCompare(b.filename);
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [images]);

  const getAllTags = useCallback(async (): Promise<string[]> => {
    try {
      return await imageStorage.getAllTags();
    } catch (err) {
      console.error('Error loading tags:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tags');
      return [];
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return {
    images,
    loading,
    error,
    addImage,
    updateImage,
    deleteImage,
    filterImages,
    getAllTags,
    refetch: loadImages
  };
};