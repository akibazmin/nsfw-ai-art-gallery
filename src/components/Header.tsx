import React, { useState, useEffect } from 'react';
import { Moon, Sun, Upload, Search, Archive, Filter, FolderOpen } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onUploadClick: () => void;
  onFolderImportClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalImages: number;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onFolderImportClick,
  searchQuery,
  onSearchChange,
  totalImages,
  onToggleFilters,
  showFilters
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Archive className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Stepmom's Archive
                </h1>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
                {totalImages} images
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleFilters}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  showFilters 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                    : 'bg-gray-100/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              
              <button
                onClick={onFolderImportClick}
                className="p-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200"
                title="Import from folder"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              
              <button
                onClick={onUploadClick}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};