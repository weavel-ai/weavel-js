import { type WeavelPersistedProperty } from "./types";

export class WeavelMemoryStorage {
  private _memoryStorage: { [key: string]: any | undefined } = {};

  getProperty(key: WeavelPersistedProperty): any | undefined {
    return this._memoryStorage[key];
  }

  setProperty(key: WeavelPersistedProperty, value: any | null): void {
    this._memoryStorage[key] = value !== null ? value : undefined;
  }
}
