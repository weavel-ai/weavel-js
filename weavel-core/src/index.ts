import {
  generateUUID,
  removeTrailingSlash,
  retriable,
  safeSetTimeout,
  type RetriableOptions,
} from './utils';
import {
  type WeavelFetchOptions,
  type WeavelFetchResponse,
  type WeavelQueueItem,
  type WeavelCoreOptions,
  type IngestionType,
  WeavelPersistedProperty,
  type CaptureTraceBody,
  type CaptureSessionBody,
  type CaptureSpanBody,
  type CaptureGenerationBody,
  type CaptureLogBody,
  type CaptureMessageBody,
  type CaptureTrackEventBody,
  type IdentifyUserBody,
  type UpdateTraceBody,
  type UpdateSpanBody,
  type UpdateGenerationBody,
} from './types';

import { SimpleEventEmitter } from './eventemitter';
export * as utils from './utils';
export { type SingleIngestionEvent } from './types';
export { WeavelMemoryStorage } from './storage-memory';

class WeavelFetchHttpError extends Error {
  name = 'WeavelFetchHttpError';
  body: string | undefined;

  constructor(
    public response: WeavelFetchResponse,
    body: string
  ) {
    super(
      'HTTP error while fetching Weavel: ' +
        response.status +
        ' and body: ' +
        body
    );
  }
}

class WeavelFetchNetworkError extends Error {
  name = 'WeavelFetchNetworkError';

  constructor(public error: unknown) {
    super(
      'Network error while fetching Weavel',
      error instanceof Error ? { cause: error } : {}
    );
  }
}

function isWeavelFetchError(err: any): boolean {
  return (
    typeof err === 'object' &&
    (err.name === 'WeavelFetchHttpError' ||
      err.name === 'WeavelFetchNetworkError')
  );
}

abstract class WeavelWorker {
  // options
  private apiKey: string;
  baseUrl: string;
  private flushAt: number;
  private flushInterval: number;
  private requestTimeout: number;
  private removeDebugCallback?: () => void;
  private debugMode: boolean = false;
  private pendingPromises: Record<string, Promise<any>> = {};
  private release: string | undefined;
  private sdkIntegration: string;
  private enabled: boolean;

  // internal
  protected _options: WeavelCoreOptions;
  protected _events = new SimpleEventEmitter();
  protected _flushTimer?: any;
  protected _retryOptions: RetriableOptions;

  // Abstract methods to be overridden by implementations
  abstract fetch(
    url: string,
    options: WeavelFetchOptions
  ): Promise<WeavelFetchResponse>;
  abstract getLibraryId(): string;
  abstract getLibraryVersion(): string;

  // This is our abstracted storage. Each implementation should handle its own
  abstract getPersistedProperty<T>(key: WeavelPersistedProperty): T | undefined;
  abstract setPersistedProperty<T>(
    key: WeavelPersistedProperty,
    value: T | null
  ): void;

  constructor(params: WeavelCoreOptions) {
    this._options = params;
    const { apiKey, enabled, ...options } = params;

    this.enabled = enabled === false ? false : true;
    this.apiKey = apiKey ?? '';
    this.baseUrl = removeTrailingSlash(
      options?.baseUrl || 'https://api.weavel.ai'
    );
    this.flushAt = options?.flushAt ? Math.max(options?.flushAt, 1) : 15;
    this.flushInterval = options?.flushInterval ?? 10000;

    this._retryOptions = {
      retryCount: options?.fetchRetryCount ?? 3,
      retryDelay: options?.fetchRetryDelay ?? 3000,
      retryCheck: isWeavelFetchError,
    };
    this.requestTimeout = options?.requestTimeout ?? 10000; // 10 seconds

    this.sdkIntegration = options?.sdkIntegration ?? 'DEFAULT';
  }

  getSdkIntegration(): string {
    return this.sdkIntegration;
  }

  protected getCommonEventProperties(): any {
    return {
      $lib: this.getLibraryId(),
      $lib_version: this.getLibraryVersion(),
    };
  }

  on(event: string, cb: (...args: any[]) => void): () => void {
    return this._events.on(event, cb);
  }

  debug(enabled: boolean = true): void {
    this.removeDebugCallback?.();

    this.debugMode = enabled;

    if (enabled) {
      this.removeDebugCallback = this.on('*', (event, payload) =>
        console.log('Weavel Debug', event, JSON.stringify(payload))
      );
    }
  }

  /***
   *** Handlers for each object type
   ***/
  protected sessionStateless(body: CaptureSessionBody): string {
    const { session_id: bodyId, created_at: bodyCreatedAt, ...rest } = body;

    const session_id = bodyId ?? generateUUID();

    const parsedBody: CaptureSessionBody = {
      session_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('capture-session', parsedBody);
    return session_id;
  }

  protected identifyUserStateless(body: IdentifyUserBody): string {
    const { created_at: bodyCreatedAt, ...rest } = body;

    const parsedBody: IdentifyUserBody = {
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('identify-user', parsedBody);
    return body.user_id;
  }

  protected messageStateless(body: CaptureMessageBody): string {
    const { record_id: bodyId, created_at: bodyCreatedAt, ...rest } = body;

    const record_id = bodyId ?? generateUUID();
    const parsedBody: CaptureMessageBody = {
      record_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('capture-message', parsedBody);
    return record_id;
  }

  protected trackEventStateless(body: CaptureTrackEventBody): string {
    const { record_id: bodyId, created_at: bodyCreatedAt, ...rest } = body;

    const record_id = bodyId ?? generateUUID();
    const parsedBody: CaptureTrackEventBody = {
      record_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('capture-track-event', parsedBody);
    return record_id;
  }

  protected traceStateless(body: CaptureTraceBody): string {
    const {
      record_id: bodyId,
      created_at: bodyCreatedAt,
      inputs: bodyInputs,
      outputs: bodyOutputs,
      ...rest
    } = body;

    const record_id = bodyId ?? generateUUID();
    const parsedBody: CaptureTraceBody = {
      record_id,
      inputs:
        typeof bodyInputs === 'string'
          ? { _RAW_VALUE_: bodyInputs }
          : bodyInputs,
      outputs:
        typeof bodyOutputs === 'string'
          ? { _RAW_VALUE_: bodyOutputs }
          : bodyOutputs,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('capture-trace', parsedBody);
    return record_id;
  }

  protected spanStateless(body: CaptureSpanBody): string {
    const {
      observation_id: bodyId,
      created_at: bodyCreatedAt,
      inputs: bodyInputs,
      outputs: bodyOutputs,
      ...rest
    } = body;

    const observation_id = bodyId || generateUUID();

    const parsedBody: CaptureSpanBody = {
      observation_id,
      inputs:
        typeof bodyInputs === 'string'
          ? { _RAW_VALUE_: bodyInputs }
          : bodyInputs,
      outputs:
        typeof bodyOutputs === 'string'
          ? { _RAW_VALUE_: bodyOutputs }
          : bodyOutputs,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('capture-span', parsedBody);
    return observation_id;
  }

  protected generationStateless(body: CaptureGenerationBody): string {
    const {
      observation_id: bodyId,
      created_at: bodyCreatedAt,
      inputs: bodyInputs,
      outputs: bodyOutputs,
      ...rest
    } = body;

    const observation_id = bodyId || generateUUID();

    const parsedBody: CaptureGenerationBody = {
      observation_id,
      inputs:
        typeof bodyInputs === 'string'
          ? { _RAW_VALUE_: bodyInputs }
          : bodyInputs,
      outputs:
        typeof bodyOutputs === 'string'
          ? { _RAW_VALUE_: bodyOutputs }
          : bodyOutputs,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };

    this.enqueue('capture-generation', parsedBody);
    return observation_id;
  }

  protected logStateless(body: CaptureLogBody): string {
    const { observation_id: bodyId, created_at: bodyCreatedAt, ...rest } = body;

    const observation_id = bodyId || generateUUID();

    const parsedBody: CaptureLogBody = {
      observation_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest,
    };
    this.enqueue('capture-log', parsedBody);
    return observation_id;
  }

  protected updateTraceStateless(body: UpdateTraceBody): string {
    const { inputs: bodyInputs, outputs: bodyOutputs, ...rest } = body;
    const parsedBody: UpdateTraceBody = {
      inputs:
        typeof bodyInputs === 'string'
          ? { _RAW_VALUE_: bodyInputs }
          : bodyInputs,
      outputs:
        typeof bodyOutputs === 'string'
          ? { _RAW_VALUE_: bodyOutputs }
          : bodyOutputs,
      ...rest,
    };
    this.enqueue('update-trace', parsedBody);
    return body.record_id;
  }

  protected updateSpanStateless(body: UpdateSpanBody): string {
    const { inputs: bodyInputs, outputs: bodyOutputs, ...rest } = body;
    const parsedBody: UpdateSpanBody = {
      inputs:
        typeof bodyInputs === 'string'
          ? { _RAW_VALUE_: bodyInputs }
          : bodyInputs,
      outputs:
        typeof bodyOutputs === 'string'
          ? { _RAW_VALUE_: bodyOutputs }
          : bodyOutputs,
      ...rest,
    };
    this.enqueue('update-span', parsedBody);
    return body.observation_id;
  }

  protected updateGenerationStateless(body: UpdateGenerationBody): string {
    const { inputs: bodyInputs, outputs: bodyOutputs, ...rest } = body;
    const parsedBody: UpdateGenerationBody = {
      inputs:
        typeof bodyInputs === 'string'
          ? { _RAW_VALUE_: bodyInputs }
          : bodyInputs,
      outputs:
        typeof bodyOutputs === 'string'
          ? { _RAW_VALUE_: bodyOutputs }
          : bodyOutputs,
      ...rest,
    };
    this.enqueue('update-generation', parsedBody);
    return body.observation_id;
  }

  protected _parsePayload(response: any): any {
    try {
      return JSON.parse(response);
    } catch {
      return response;
    }
  }

  /***
   *** QUEUEING AND FLUSHING
   ***/
  protected enqueue(type: IngestionType, body: any): void {
    try {
      if (!this.enabled) {
        return;
      }

      try {
        JSON.stringify(body);
      } catch (e) {
        console.error(`Event Body for ${type} is not JSON-serializable: ${e}`);
        this._events.emit(
          'error',
          `Event Body for ${type} is not JSON-serializable: ${e}`
        );

        return;
      }

      const queue =
        this.getPersistedProperty<WeavelQueueItem[]>(
          WeavelPersistedProperty.Queue
        ) || [];

      queue.push({
        type,
        body,
      });
      this.setPersistedProperty<WeavelQueueItem[]>(
        WeavelPersistedProperty.Queue,
        queue
      );

      this._events.emit(type, body);

      // Flush queued events if we meet the flushAt length
      if (queue.length >= this.flushAt) {
        this.flush();
      }

      if (this.flushInterval && !this._flushTimer) {
        this._flushTimer = safeSetTimeout(
          () => this.flush(),
          this.flushInterval
        );
      }
    } catch (e) {
      this._events.emit('error', e);
    }
  }

  /**
   * Asynchronously flushes all events that are not yet sent to the server.
   * This function always resolves, even if there were errors when flushing.
   * Errors are emitted as "error" events and the promise resolves.
   *
   * @returns {Promise<void>} A promise that resolves when the flushing is completed.
   */
  flushAsync(): Promise<void> {
    return new Promise((resolve, _reject) => {
      try {
        this.flush((err, data) => {
          if (err) {
            console.error('Error while flushing Weavel', err);
            resolve();
          } else {
            resolve(data);
          }
        });
      } catch (e) {
        console.error('Error while flushing Weavel', e);
      }
    });
  }

  // Flushes all events that are not yet sent to the server
  flush(callback?: (err?: any, data?: any) => void): void {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }

    const queue =
      this.getPersistedProperty<WeavelQueueItem[]>(
        WeavelPersistedProperty.Queue
      ) || [];

    if (!queue.length) {
      return callback?.();
    }

    const items = queue.splice(0, this.flushAt);
    this.setPersistedProperty<WeavelQueueItem[]>(
      WeavelPersistedProperty.Queue,
      queue
    );

    const MAX_MSG_SIZE = 1_000_000;
    const BATCH_SIZE_LIMIT = 2_500_000;

    this.processQueueItems(items, MAX_MSG_SIZE, BATCH_SIZE_LIMIT);

    const promiseUUID = generateUUID();

    const done = (err?: any): void => {
      if (err) {
        this._events.emit('error', err);
      }
      callback?.(err, items);
      this._events.emit('flush', items);
    };

    const payload = JSON.stringify({
      batch: items,
      metadata: {
        batch_size: items.length,
        sdk_integration: this.sdkIntegration,
        sdk_version: this.getLibraryVersion(),
        sdk_variant: this.getLibraryId(),
        sdk_name: 'weavel-js',
      },
    }); // implicit conversion also of dates to strings

    const url = `${this.baseUrl}/public/v2/batch`;

    const fetchOptions = this._getFetchOptions({
      method: 'POST',
      body: payload,
    });

    const requestPromise = this.fetchWithRetry(url, fetchOptions)
      .then(() => done())
      .catch((err) => {
        done(err);
      });
    this.pendingPromises[promiseUUID] = requestPromise;
    requestPromise.finally(() => {
      delete this.pendingPromises[promiseUUID];
    });
  }

  public processQueueItems(
    queue: WeavelQueueItem[],
    MAX_MSG_SIZE: number,
    BATCH_SIZE_LIMIT: number
  ): { processedItems: WeavelQueueItem[]; remainingItems: WeavelQueueItem[] } {
    let totalSize = 0;
    const processedItems: WeavelQueueItem[] = [];
    const remainingItems: WeavelQueueItem[] = [];

    for (let i = 0; i < queue.length; i++) {
      try {
        const itemSize = new Blob([JSON.stringify(queue[i])]).size;

        // discard item if it exceeds the maximum size per event
        if (itemSize > MAX_MSG_SIZE) {
          console.warn(
            `Item exceeds size limit (size: ${itemSize}), dropping item.`
          );
          continue;
        }

        // if adding the next item would exceed the batch size limit, stop processing
        if (totalSize + itemSize >= BATCH_SIZE_LIMIT) {
          console.debug(`hit batch size limit (size: ${totalSize + itemSize})`);
          remainingItems.push(...queue.slice(i));
          console.log(`Remaining items: ${remainingItems.length}`);
          console.log(`processes items: ${processedItems.length}`);
          break;
        }

        // only add the item if it passes both requirements
        totalSize += itemSize;
        processedItems.push(queue[i]);
      } catch (error) {
        console.error(error);
        remainingItems.push(...queue.slice(i));
        break;
      }
    }

    return { processedItems, remainingItems };
  }

  _getFetchOptions(p: {
    method: WeavelFetchOptions['method'];
    body?: WeavelFetchOptions['body'];
  }): WeavelFetchOptions {
    const fetchOptions: WeavelFetchOptions = {
      method: p.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Weavel-Sdk-Name': 'weavel-js',
        'X-Weavel-Sdk-Version': this.getLibraryVersion(),
        'X-Weavel-Sdk-Variant': this.getLibraryId(),
        'X-Weavel-Sdk-Integration': this.sdkIntegration,
        ...this.constructAuthorizationHeader(this.apiKey),
      },
      body: p.body,
    };

    return fetchOptions;
  }

  private constructAuthorizationHeader(apiKey: string): {
    Authorization: string;
  } {
    return { Authorization: 'Bearer ' + apiKey };
  }

  private async fetchWithRetry(
    url: string,
    options: WeavelFetchOptions,
    retryOptions?: RetriableOptions
  ): Promise<WeavelFetchResponse> {
    (AbortSignal as any).timeout ??= function timeout(ms: number) {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), ms);
      return ctrl.signal;
    };

    return await retriable(
      async () => {
        let res: WeavelFetchResponse | null = null;
        try {
          res = await this.fetch(url, {
            signal: (AbortSignal as any).timeout(this.requestTimeout),
            ...options,
          });
        } catch (e) {
          // fetch will only throw on network errors or on timeouts
          throw new WeavelFetchNetworkError(e);
        }

        if (res.status < 200 || res.status >= 400) {
          const body = await res.json();
          throw new WeavelFetchHttpError(res, JSON.stringify(body));
        }
        return res;
      },
      { ...this._retryOptions, ...retryOptions },
      (string) =>
        this._events.emit(
          'retry',
          string + ', ' + url + ', ' + JSON.stringify(options)
        )
    );
  }

  async shutdownAsync(): Promise<void> {
    clearTimeout(this._flushTimer);
    try {
      await this.flushAsync();
      await Promise.all(
        Object.values(this.pendingPromises).map((x) =>
          x.catch(() => {
            // ignore errors as we are shutting down and can't deal with them anyways.
          })
        )
      );
      // flush again in case there are new events that were added while we were waiting for the pending promises to resolve
      await this.flushAsync();
    } catch (e) {
      console.error('Error while shutting down Weavel', e);
    }
  }

  protected async awaitAllQueuedAndPendingRequests(): Promise<void> {
    clearTimeout(this._flushTimer);
    await this.flushAsync();
    await Promise.all(Object.values(this.pendingPromises));
  }
}

export abstract class WeavelWebWorker extends WeavelWorker {
  constructor(params: WeavelCoreOptions) {
    const { flushAt, flushInterval, apiKey, enabled, ...rest } = params;
    let isObservabilityEnabled = enabled === false ? false : true;

    if (!isObservabilityEnabled) {
      console.warn(
        'Weavel is disabled. No observability data will be sent to Weavel.'
      );
    } else if (!apiKey) {
      isObservabilityEnabled = false;
      console.warn(
        "Weavel API key not passed to constructor and not set as 'WEAVEL_API_KEY' environment variable. No observability data will be sent to Weavel."
      );
    }

    super({
      ...rest,
      apiKey,
      flushAt: flushAt ?? 1,
      flushInterval: flushInterval ?? 0,
      enabled: isObservabilityEnabled,
    });
  }

  async identify(body: IdentifyUserBody): Promise<this> {
    this.identifyUserStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }

  async session(body: CaptureSessionBody): Promise<WeavelWebSessionClient> {
    const id = this.sessionStateless(body);
    const s = new WeavelWebSessionClient(this, id);
    await this.awaitAllQueuedAndPendingRequests();
    return s;
  }

  async track(body: CaptureTrackEventBody): Promise<this> {
    this.trackEventStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }

  async message(body: CaptureMessageBody): Promise<this> {
    this.messageStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }

  async trace(body: CaptureTraceBody): Promise<WeavelWebTraceClient> {
    const id = this.traceStateless(body);
    const t = new WeavelWebTraceClient(this, id);
    await this.awaitAllQueuedAndPendingRequests();
    return t;
  }

  async _span(body: CaptureSpanBody): Promise<WeavelWebSpanClient> {
    const id = this.spanStateless(body);
    const s = new WeavelWebSpanClient(this, id, body.record_id);
    await this.awaitAllQueuedAndPendingRequests();
    return s;
  }

  async _log(body: CaptureLogBody): Promise<this> {
    this.logStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }

  async _generation(
    body: CaptureGenerationBody
  ): Promise<WeavelWebGenerationClient> {
    const id = this.generationStateless(body);
    const g = new WeavelWebGenerationClient(this, id, body.record_id);
    await this.awaitAllQueuedAndPendingRequests();
    return g;
  }

  async _updateTrace(body: UpdateTraceBody): Promise<this> {
    this.updateTraceStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }

  async _updateSpan(body: UpdateSpanBody): Promise<this> {
    this.updateSpanStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }

  async _updateGeneration(body: UpdateGenerationBody): Promise<this> {
    this.updateGenerationStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }
}

export class WeavelWebSessionClient {
  public readonly client: WeavelWebWorker;
  public readonly id: string; // id of item itself

  constructor(client: WeavelWebWorker, id: string) {
    this.client = client;
    this.id = id;
  }

  async track(
    body: Omit<CaptureTrackEventBody, 'session_id'>
  ): Promise<WeavelWebWorker> {
    return await this.client.track({ session_id: this.id, ...body });
  }

  async message(
    body: Omit<CaptureMessageBody, 'session_id'>
  ): Promise<WeavelWebWorker> {
    return await this.client.message({ session_id: this.id, ...body });
  }

  async span(body: CaptureSpanBody): Promise<WeavelWebSpanClient> {
    return await this.client._span(body);
  }

  async log(body: CaptureLogBody): Promise<WeavelWebWorker> {
    return await this.client._log(body);
  }

  async generation(
    body: CaptureGenerationBody
  ): Promise<WeavelWebGenerationClient> {
    return await this.client._generation(body);
  }
}

export abstract class WeavelWebObjectClient {
  public readonly client: WeavelWebWorker;
  public readonly id: string; // id of item itself
  public readonly recordId: string | null | undefined; // id of trace, if traceClient this is the same as id
  public readonly observationId: string | null; // id of observation, if observationClient this is the same as id, if traceClient this is null

  constructor({
    client,
    id,
    recordId,
    observationId,
  }: {
    client: WeavelWebWorker;
    id: string;
    recordId?: string | null;
    observationId: string | null;
  }) {
    this.client = client;
    this.id = id;
    this.recordId = recordId ?? null;
    this.observationId = observationId;
  }

  async span(
    body: Omit<CaptureSpanBody, 'record_id' | 'parent_observation_id'>
  ): Promise<WeavelWebSpanClient> {
    return await this.client._span({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId,
    });
  }

  async log(
    body: Omit<CaptureLogBody, 'record_id' | 'parent_observation_id'>
  ): Promise<WeavelWebWorker> {
    return await this.client._log({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId,
    });
  }

  async generation(
    body: Omit<CaptureGenerationBody, 'record_id' | 'parent_observation_id'>
  ): Promise<WeavelWebGenerationClient> {
    return await this.client._generation({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId,
    });
  }
}

export class WeavelWebTraceClient extends WeavelWebObjectClient {
  constructor(client: WeavelWebWorker, recordId: string) {
    super({ client, id: recordId, recordId, observationId: null });
  }

  async update(body: Omit<UpdateTraceBody, 'record_id'>): Promise<this> {
    await this.client._updateTrace({
      ...body,
      record_id: this.id,
    });
    return this;
  }

  async end(
    body?: Omit<UpdateTraceBody, 'record_id' | 'ended_at'>
  ): Promise<this> {
    await this.client._updateTrace({
      ...body,
      record_id: this.id,
      ended_at: new Date().toISOString(),
    });
    return this;
  }
}

export class WeavelWebSpanClient extends WeavelWebObjectClient {
  constructor(client: WeavelWebWorker, id: string, recordId?: string | null) {
    super({ client, id, recordId, observationId: id });
  }

  async update(
    body: Omit<UpdateSpanBody, 'observation_id' | 'record_id'>
  ): Promise<this> {
    await this.client._updateSpan({
      ...body,
      observation_id: this.id,
    });
    return this;
  }

  async end(): Promise<this> {
    await this.client._updateSpan({
      observation_id: this.id,
      ended_at: new Date().toISOString(),
    });
    return this;
  }
}

export class WeavelWebGenerationClient {
  public readonly client: WeavelWebWorker;
  public readonly id: string; // id of generation
  public readonly recordId: string | null | undefined; // id of trace record

  constructor(client: WeavelWebWorker, id: string, recordId?: string | null) {
    this.client = client;
    this.id = id;
    this.recordId = recordId ?? null;
  }

  async update(
    body: Omit<UpdateGenerationBody, 'observation_id' | 'record_id'>
  ): Promise<this> {
    await this.client._updateGeneration({
      ...body,
      observation_id: this.id,
    });
    return this;
  }

  async end(): Promise<this> {
    await this.client._updateGeneration({
      observation_id: this.id,
      ended_at: new Date().toISOString(),
    });
    return this;
  }
}

export abstract class WeavelCoreWorker extends WeavelWorker {
  constructor(params: WeavelCoreOptions) {
    const { apiKey, enabled } = params;
    let isObservabilityEnabled = enabled === false ? false : true;

    if (!isObservabilityEnabled) {
      console.warn(
        'Weavel is disabled. No observability data will be sent to Weavel.'
      );
    } else if (!apiKey) {
      isObservabilityEnabled = false;
      console.warn(
        "Weavel API key was not passed to constructor or not set as 'WEAVEL_API_KEY' environment variable. No observability data will be sent to Weavel."
      );
    }

    super({ ...params, enabled: isObservabilityEnabled });
  }

  identify(body: IdentifyUserBody): this {
    this.identifyUserStateless(body);
    return this;
  }

  session(body: CaptureSessionBody): WeavelSessionClient {
    const id = this.sessionStateless(body);
    const s = new WeavelSessionClient(this, id);
    return s;
  }

  track(body: CaptureTrackEventBody): this {
    this.trackEventStateless(body);
    return this;
  }

  trace(body: CaptureTraceBody): WeavelTraceClient {
    const id = this.traceStateless(body);
    const t = new WeavelTraceClient(this, id);
    return t;
  }

  _span(body: CaptureSpanBody): WeavelSpanClient {
    const id = this.spanStateless(body);
    return new WeavelSpanClient(this, id, body.record_id);
  }

  _generation(body: CaptureGenerationBody): WeavelGenerationClient {
    const id = this.generationStateless(body);
    return new WeavelGenerationClient(this, id, body.record_id);
  }

  _log(body: CaptureLogBody): this {
    this.logStateless(body);
    return this;
  }

  _updateTrace(body: UpdateTraceBody): this {
    this.updateTraceStateless(body);
    return this;
  }

  _updateSpan(body: UpdateSpanBody): this {
    this.updateSpanStateless(body);
    return this;
  }

  _updateGeneration(body: UpdateGenerationBody): this {
    this.updateGenerationStateless(body);
    return this;
  }
}

export class WeavelSessionClient {
  public readonly client: WeavelCoreWorker;
  public readonly id: string; // id of item itself

  constructor(client: WeavelCoreWorker, id: string) {
    this.client = client;
    this.id = id;
  }

  trace(body: Omit<CaptureTraceBody, 'session_id'>): WeavelTraceClient {
    return this.client.trace({ session_id: this.id, ...body });
  }

  span(body: CaptureSpanBody): WeavelSpanClient {
    return this.client._span(body);
  }

  generation(body: CaptureGenerationBody): WeavelGenerationClient {
    return this.client._generation(body);
  }

  log(body: CaptureLogBody): WeavelCoreWorker {
    return this.client._log(body);
  }
}

export abstract class WeavelObjectClient {
  public readonly client: WeavelCoreWorker;
  public readonly id: string; // id of item itself
  public readonly recordId?: string | null; // id of trace, if traceClient this is the same as id
  public readonly observationId: string | null; // id of observation, if observationClient this is the same as id, if traceClient this is null

  constructor({
    client,
    id,
    recordId,
    observationId,
  }: {
    client: WeavelCoreWorker;
    id: string;
    recordId?: string | null;
    observationId: string | null;
  }) {
    this.client = client;
    this.id = id;
    this.recordId = recordId ?? null;
    this.observationId = observationId;
  }

  span(
    body: Omit<CaptureSpanBody, 'record_id' | 'parent_observation_id'>
  ): WeavelSpanClient {
    return this.client._span({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId,
    });
  }

  log(
    body: Omit<CaptureLogBody, 'record_id' | 'parent_observation_id'>
  ): WeavelCoreWorker {
    return this.client._log({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId,
    });
  }

  generation(
    body: Omit<CaptureGenerationBody, 'record_id' | 'parent_observation_id'>
  ): WeavelGenerationClient {
    return this.client._generation({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId,
    });
  }
}

export class WeavelTraceClient extends WeavelObjectClient {
  constructor(client: WeavelCoreWorker, recordId: string) {
    super({ client, id: recordId, recordId, observationId: null });
  }

  update(body: Omit<UpdateTraceBody, 'record_id'>): this {
    this.client._updateTrace({
      ...body,
      record_id: this.id,
    });
    return this;
  }

  end(body?: Omit<UpdateTraceBody, 'record_id' | 'ended_at'>): this {
    this.client._updateTrace({
      ...body,
      record_id: this.id,
      ended_at: new Date().toISOString(),
    });
    return this;
  }
}

export class WeavelSpanClient extends WeavelObjectClient {
  constructor(client: WeavelCoreWorker, id: string, recordId?: string | null) {
    super({ client, id, recordId, observationId: id });
  }

  update(body: Omit<UpdateSpanBody, 'observation_id' | 'record_id'>): this {
    this.client._updateSpan({
      ...body,
      observation_id: this.id,
    });
    return this;
  }

  end(): this {
    this.client._updateSpan({
      observation_id: this.id,
      ended_at: new Date().toISOString(),
    });
    return this;
  }
}

export class WeavelGenerationClient {
  public readonly client: WeavelCoreWorker;
  public readonly id: string; // id of generation
  public readonly recordId?: string | null; // id of trace record

  constructor(client: WeavelCoreWorker, id: string, recordId?: string | null) {
    this.client = client;
    this.id = id;
    this.recordId = recordId ?? null;
  }

  update(
    body: Omit<UpdateGenerationBody, 'observation_id' | 'record_id'>
  ): this {
    this.client._updateGeneration({
      ...body,
      observation_id: this.id,
    });
    return this;
  }

  end(): this {
    this.client._updateGeneration({
      observation_id: this.id,
      ended_at: new Date().toISOString(),
    });
    return this;
  }
}

export * from './types';
export * from './openapi/server';
