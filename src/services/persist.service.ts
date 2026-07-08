export interface IPersistService {
  saveCanvasState(bouquetId: string, jsonState: string): Promise<boolean>;
  loadCanvasState(bouquetId: string): Promise<string | null>;
}

export class MockPersistService implements IPersistService {
  private storageKeyPrefix = 'bloombox_bouquet_';

  async saveCanvasState(bouquetId: string, jsonState: string): Promise<boolean> {
    // Simulate database network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Simulate random connection failure (1% chance) for testing robustness
      if (Math.random() < 0.01) {
        throw new Error('Database connection timeout');
      }

      localStorage.setItem(`${this.storageKeyPrefix}${bouquetId}`, jsonState);
      return true;
    } catch (error) {
      console.error('Failed to save canvas state:', error);
      return false;
    }
  }

  async loadCanvasState(bouquetId: string): Promise<string | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return localStorage.getItem(`${this.storageKeyPrefix}${bouquetId}`);
  }
}

export const persistService = new MockPersistService();
