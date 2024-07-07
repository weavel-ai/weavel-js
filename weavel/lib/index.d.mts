import { WeavelCoreOptions, WeavelCore, WeavelPersistedProperty, WeavelFetchOptions, WeavelFetchResponse, WeavelWebStateless } from 'weavel-core';
export { WeavelGenerationClient, WeavelSpanClient, WeavelTraceClient } from 'weavel-core';

type WeavelOptions = {
    persistence?: "localStorage" | "sessionStorage" | "cookie" | "memory";
    persistence_name?: string;
    enabled?: boolean;
} & WeavelCoreOptions;

declare class Weavel extends WeavelCore {
    private _storage;
    private _storageCache;
    private _storageKey;
    constructor(params?: {
        apiKey?: string;
    } & WeavelOptions);
    getPersistedProperty<T>(key: WeavelPersistedProperty): T | undefined;
    setPersistedProperty<T>(key: WeavelPersistedProperty, value: T | null): void;
    fetch(url: string, options: WeavelFetchOptions): Promise<WeavelFetchResponse>;
    getLibraryId(): string;
    getLibraryVersion(): string;
    getCustomUserAgent(): void;
}
declare class WeavelWeb extends WeavelWebStateless {
    private _storage;
    private _storageCache;
    private _storageKey;
    constructor(params?: WeavelOptions);
    getPersistedProperty<T>(key: WeavelPersistedProperty): T | undefined;
    setPersistedProperty<T>(key: WeavelPersistedProperty, value: T | null): void;
    fetch(url: string, options: WeavelFetchOptions): Promise<WeavelFetchResponse>;
    getLibraryId(): string;
    getLibraryVersion(): string;
    getCustomUserAgent(): void;
}

export { Weavel, type WeavelOptions, WeavelWeb, Weavel as default };
