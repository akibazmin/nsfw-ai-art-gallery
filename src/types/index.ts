export interface ImageMetadata {
  id: string;
  filename: string;
  url: string;
  blob: Blob;
  prompt?: string;
  negativePrompt?: string;
  seed?: string;
  tags: string[];
  rating: number;
  dateAdded: Date;
  lastModified: Date;
}

export interface SearchFilters {
  query: string;
  selectedTags: string[];
  sortBy: 'newest' | 'oldest' | 'alphabetical' | 'rating' | 'recent';
  minRating: number;
}

export type Theme = 'light' | 'dark';