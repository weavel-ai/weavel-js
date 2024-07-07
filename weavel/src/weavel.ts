import {
  WeavelCore,
  WeavelWebStateless,
  type WeavelFetchOptions,
  type WeavelFetchResponse,
  type WeavelPersistedProperty,
  utils,
} from "weavel-core";
import { type WeavelStorage, getStorage } from "./storage";
import { version } from "../package.json";
import { type WeavelOptions } from "./types";

// Required when users pass these as typed arguments
export {
  type WeavelTraceClient,
  type WeavelSpanClient,
  type WeavelGenerationClient,
} from "weavel-core";

export class Weavel extends WeavelCore {
  private _storage: WeavelStorage;
  private _storageCache: any;
  private _storageKey: string;

  constructor(params?: { apiKey?: string;  } & WeavelOptions) {
    const weavelConfig = utils.configWeavelSDK(params);
    super(weavelConfig);

    if (typeof window !== "undefined" && "Deno" in window === false) {
      this._storageKey = params?.persistence_name
        ? `lf_${params.persistence_name}`
        : `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage(params?.persistence || "localStorage", window);
    } else {
      this._storageKey = `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage("memory", undefined);
    }
  }

  getPersistedProperty<T>(key: WeavelPersistedProperty): T | undefined {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }

    return this._storageCache[key];
  }

  setPersistedProperty<T>(key: WeavelPersistedProperty, value: T | null): void {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }

    if (value === null) {
      delete this._storageCache[key];
    } else {
      this._storageCache[key] = value;
    }

    this._storage.setItem(this._storageKey, JSON.stringify(this._storageCache));
  }

  fetch(url: string, options: WeavelFetchOptions): Promise<WeavelFetchResponse> {
    return fetch(url, options);
  }

  getLibraryId(): string {
    return "weavel";
  }

  getLibraryVersion(): string {
    return version;
  }

  getCustomUserAgent(): void {
    return;
  }
}

export class WeavelWeb extends WeavelWebStateless {
  private _storage: WeavelStorage;
  private _storageCache: any;
  private _storageKey: string;

  constructor(params?: WeavelOptions) {
    const weavelConfig = utils.configWeavelSDK(params);
    super(weavelConfig);

    if (typeof window !== "undefined") {
      this._storageKey = params?.persistence_name
        ? `lf_${params.persistence_name}`
        : `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage(params?.persistence || "localStorage", window);
    } else {
      this._storageKey = `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage("memory", undefined);
    }
  }

  getPersistedProperty<T>(key: WeavelPersistedProperty): T | undefined {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }

    return this._storageCache[key];
  }

  setPersistedProperty<T>(key: WeavelPersistedProperty, value: T | null): void {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }

    if (value === null) {
      delete this._storageCache[key];
    } else {
      this._storageCache[key] = value;
    }

    this._storage.setItem(this._storageKey, JSON.stringify(this._storageCache));
  }

  fetch(url: string, options: WeavelFetchOptions): Promise<WeavelFetchResponse> {
    return fetch(url, options);
  }

  getLibraryId(): string {
    return "weavel-frontend";
  }

  getLibraryVersion(): string {
    return version;
  }

  getCustomUserAgent(): void {
    return;
  }
}
