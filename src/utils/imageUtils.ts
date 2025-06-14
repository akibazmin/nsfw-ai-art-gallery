import { ImageMetadata } from '../types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createImageFromFile = async (file: File): Promise<ImageMetadata> => {
  const url = URL.createObjectURL(file);
  
  return {
    id: generateId(),
    filename: file.name,
    url,
    blob: file,
    prompt: '',
    negativePrompt: '',
    seed: '',
    tags: [],
    rating: 0,
    dateAdded: new Date(),
    lastModified: new Date()
  };
};

export const parseTags = (tagString: string): string[] => {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

export const formatTags = (tags: string[]): string => {
  return tags.join(', ');
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
  });
};