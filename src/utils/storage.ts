import { ImageMetadata } from '../types';

const DB_NAME = 'StepmomArchive';
const DB_VERSION = 1;
const STORE_NAME = 'images';

class ImageStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, falling back to memory storage');
        this.db = null;
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        this.db = null;
        resolve(); // Don't reject, fall back to memory storage
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        try {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('filename', 'filename', { unique: false });
            store.createIndex('dateAdded', 'dateAdded', { unique: false });
            store.createIndex('rating', 'rating', { unique: false });
            store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          }
        } catch (error) {
          console.error('Error creating object store:', error);
        }
      };

      request.onblocked = () => {
        console.warn('IndexedDB upgrade blocked');
      };
    });

    return this.initPromise;
  }

  private memoryStorage: ImageMetadata[] = [];

  async saveImage(metadata: ImageMetadata): Promise<void> {
    await this.init();

    if (!this.db) {
      // Fall back to memory storage
      const existingIndex = this.memoryStorage.findIndex(img => img.id === metadata.id);
      if (existingIndex >= 0) {
        this.memoryStorage[existingIndex] = metadata;
      } else {
        this.memoryStorage.push(metadata);
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.put(metadata);
        request.onerror = () => {
          console.error('Failed to save image:', request.error);
          reject(request.error);
        };
        request.onsuccess = () => resolve();
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }

  async getAllImages(): Promise<ImageMetadata[]> {
    await this.init();

    if (!this.db) {
      // Return from memory storage
      return this.memoryStorage.map(img => ({
        ...img,
        dateAdded: new Date(img.dateAdded),
        lastModified: new Date(img.lastModified)
      }));
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.getAll();
        request.onerror = () => {
          console.error('Failed to get images:', request.error);
          reject(request.error);
        };
        request.onsuccess = () => {
          const images = request.result.map(img => ({
            ...img,
            dateAdded: new Date(img.dateAdded),
            lastModified: new Date(img.lastModified)
          }));
          resolve(images);
        };
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }

  async updateImage(metadata: ImageMetadata): Promise<void> {
    metadata.lastModified = new Date();
    return this.saveImage(metadata);
  }

  async deleteImage(id: string): Promise<void> {
    await this.init();

    if (!this.db) {
      // Remove from memory storage
      this.memoryStorage = this.memoryStorage.filter(img => img.id !== id);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.delete(id);
        request.onerror = () => {
          console.error('Failed to delete image:', request.error);
          reject(request.error);
        };
        request.onsuccess = () => resolve();
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }

  async getAllTags(): Promise<string[]> {
    const images = await this.getAllImages();
    const tagSet = new Set<string>();
    
    images.forEach(img => {
      img.tags.forEach(tag => tagSet.add(tag));
    });
    
    return Array.from(tagSet).sort();
  }
}

export const imageStorage = new ImageStorage();