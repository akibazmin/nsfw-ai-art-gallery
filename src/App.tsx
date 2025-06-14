import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { Gallery } from './components/Gallery';
import { UploadZone } from './components/UploadZone';
import { FolderImport } from './components/FolderImport';
import { useImages } from './hooks/useImages';
import { useTheme } from './hooks/useTheme';
import { SearchFilters } from './types';

function App() {
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderImport, setShowFolderImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    selectedTags: [],
    sortBy: 'newest',
    minRating: 0
  });

  const {
    images,
    loading,
    error,
    addImage,
    updateImage,
    deleteImage,
    filterImages,
    getAllTags
  } = useImages();

  const { theme } = useTheme();

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to load tags:', err);
      }
    };
    
    if (!loading) {
      loadTags();
    }
  }, [getAllTags, images, loading]);

  const handleImagesUploaded = async (uploadedImages: any[]) => {
    try {
      for (const image of uploadedImages) {
        await addImage(image);
      }
      setShowUpload(false);
      
      // Refresh tags
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to upload images:', err);
    }
  };

  const handleFolderImported = async (importedImages: any[]) => {
    try {
      for (const image of importedImages) {
        await addImage(image);
      }
      setShowFolderImport(false);
      
      // Refresh tags
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to import folder:', err);
    }
  };

  const handleImageUpdate = async (image: any) => {
    try {
      await updateImage(image);
      
      // Refresh tags
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to update image:', err);
    }
  };

  const handleImageDelete = async (id: string) => {
    try {
      await deleteImage(id);
      
      // Refresh tags
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const filteredImages = filterImages(filters);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Storage Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            The app is running in fallback mode. Your data will be stored temporarily in memory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header
        onUploadClick={() => setShowUpload(true)}
        onFolderImportClick={() => setShowFolderImport(true)}
        searchQuery={filters.query}
        onSearchChange={(query) => setFilters(prev => ({ ...prev, query }))}
        totalImages={images.length}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {showFilters && (
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          availableTags={availableTags}
        />
      )}

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
        showFilters ? 'pt-32' : 'pt-20'
      }`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your archive...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredImages.length < images.length && images.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <p className="text-blue-800 dark:text-blue-200 text-center">
                  Showing {filteredImages.length} of {images.length} images
                </p>
              </div>
            )}
            
            <Gallery
              images={filteredImages}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
            />
          </>
        )}
      </main>

      {showUpload && (
        <UploadZone
          onImagesUploaded={handleImagesUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showFolderImport && (
        <FolderImport
          onImagesImported={handleFolderImported}
          onClose={() => setShowFolderImport(false)}
        />
      )}
    </div>
  );
}

export default App;