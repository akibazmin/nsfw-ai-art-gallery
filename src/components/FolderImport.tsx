import React, { useState } from 'react';
import { X, FolderOpen, Upload } from 'lucide-react';
import { ImageMetadata } from '../types';
import { createImageFromFile } from '../utils/imageUtils';

interface FolderImportProps {
  onImagesImported: (images: ImageMetadata[]) => void;
  onClose: () => void;
}

export const FolderImport: React.FC<FolderImportProps> = ({ onImagesImported, onClose }) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImporting(true);
    setProgress(0);

    try {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );

      const images: ImageMetadata[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const image = await createImageFromFile(file);
        
        // Set default metadata for imported images
        image.prompt = 'N/A';
        image.negativePrompt = 'N/A';
        image.seed = 'N/A';
        image.tags = [];
        image.rating = 0;
        
        images.push(image);
        setProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }

      onImagesImported(images);
      onClose();
    } catch (error) {
      console.error('Error importing folder:', error);
      alert('Error importing images from folder');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import from Folder</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {importing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Importing images...</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{progress}%</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a folder to import
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                All images in the selected folder will be imported with default metadata. You can edit the metadata later.
              </p>
            </div>

            <input
              type="file"
              webkitdirectory=""
              multiple
              accept="image/*"
              onChange={handleFolderSelect}
              className="hidden"
              id="folder-import"
            />
            
            <label
              htmlFor="folder-import"
              className="flex items-center justify-center space-x-2 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 cursor-pointer transition-all transform hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              <span>Choose Folder</span>
            </label>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Note: This will import all images from the selected folder and its subfolders.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};