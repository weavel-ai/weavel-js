'use strict';

function assert(truthyValue, message) {
  if (!truthyValue) {
    throw new Error(message);
  }
}
function removeTrailingSlash(url) {
  return url?.replace(/\/+$/, "");
}
async function retriable(fn, props = {}, log) {
  const {
    retryCount = 3,
    retryDelay = 5000,
    retryCheck = () => true
  } = props;
  let lastError = null;
  for (let i = 0; i < retryCount + 1; i++) {
    if (i > 0) {
      // don't wait when it's the first try
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      log(`Retrying ${i + 1} of ${retryCount + 1}`);
    }
    try {
      const res = await fn();
      return res;
    } catch (e) {
      lastError = e;
      if (!retryCheck(e)) {
        throw e;
      }
      log(`Retriable error: ${JSON.stringify(e)}`);
    }
  }
  throw lastError;
}
// https://stackoverflow.com/a/8809472
function generateUUID(globalThis) {
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 = globalThis && globalThis.performance && globalThis.performance.now && globalThis.performance.now() * 1000 || 0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
  });
}
function currentTimestamp() {
  return new Date().getTime();
}
function currentISOTime() {
  return new Date().toISOString();
}
function safeSetTimeout(fn, timeout) {
  // NOTE: we use this so rarely that it is totally fine to do `safeSetTimeout(fn, 0)``
  // rather than setImmediate.
  const t = setTimeout(fn, timeout);
  // We unref if available to prevent Node.js hanging on exit
  t?.unref && t?.unref();
  return t;
}
function getEnv(key) {
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key];
  } else if (typeof globalThis !== "undefined") {
    return globalThis[key];
  }
  return;
}
function configWeavelSDK(params) {
  const {
    apiKey,
    ...coreOptions
  } = params ?? {};
  // check environment variables if values not provided
  const finalAPIKey = apiKey ?? getEnv("WEAVEL_PUBLIC_KEY");
  const finalBaseUrl = coreOptions.baseUrl ?? getEnv("WEAVEL_BASEURL");
  const finalCoreOptions = {
    ...coreOptions,
    baseUrl: finalBaseUrl
  };
  return {
    apiKey: finalAPIKey,
    ...finalCoreOptions
  };
}
const encodeQueryParams = params => {
  const queryParams = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  return queryParams.toString();
};

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  assert: assert,
  configWeavelSDK: configWeavelSDK,
  currentISOTime: currentISOTime,
  currentTimestamp: currentTimestamp,
  encodeQueryParams: encodeQueryParams,
  generateUUID: generateUUID,
  getEnv: getEnv,
  removeTrailingSlash: removeTrailingSlash,
  retriable: retriable,
  safeSetTimeout: safeSetTimeout
});

exports.WeavelPersistedProperty = void 0;
(function (WeavelPersistedProperty) {
  WeavelPersistedProperty["Props"] = "props";
  WeavelPersistedProperty["Queue"] = "queue";
  WeavelPersistedProperty["OptedOut"] = "opted_out";
})(exports.WeavelPersistedProperty || (exports.WeavelPersistedProperty = {}));

class SimpleEventEmitter {
  constructor() {
    this.events = {};
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => {
      this.events[event] = this.events[event].filter(x => x !== listener);
    };
  }
  emit(event, payload) {
    for (const listener of this.events[event] || []) {
      listener(payload);
    }
    for (const listener of this.events["*"] || []) {
      listener(event, payload);
    }
  }
}

class WeavelMemoryStorage {
  constructor() {
    this._memoryStorage = {};
  }
  getProperty(key) {
    return this._memoryStorage[key];
  }
  setProperty(key, value) {
    this._memoryStorage[key] = value !== null ? value : undefined;
  }
}

class WeavelFetchHttpError extends Error {
  constructor(response, body) {
    super("HTTP error while fetching Weavel: " + response.status + " and body: " + body);
    this.response = response;
    this.name = "WeavelFetchHttpError";
  }
}
class WeavelFetchNetworkError extends Error {
  constructor(error) {
    super("Network error while fetching Weavel", error instanceof Error ? {
      cause: error
    } : {});
    this.error = error;
    this.name = "WeavelFetchNetworkError";
  }
}
function isWeavelFetchError(err) {
  return typeof err === "object" && (err.name === "WeavelFetchHttpError" || err.name === "WeavelFetchNetworkError");
}
class WeavelCoreStateless {
  constructor(params) {
    this.debugMode = false;
    this.pendingPromises = {};
    this._events = new SimpleEventEmitter();
    this._options = params;
    const {
      apiKey,
      enabled,
      ...options
    } = params;
    this.enabled = enabled === false ? false : true;
    this.apiKey = apiKey ?? "";
    this.baseUrl = removeTrailingSlash(options?.baseUrl || "https://api.weavel.ai");
    this.flushAt = options?.flushAt ? Math.max(options?.flushAt, 1) : 15;
    this.flushInterval = options?.flushInterval ?? 10000;
    this._retryOptions = {
      retryCount: options?.fetchRetryCount ?? 3,
      retryDelay: options?.fetchRetryDelay ?? 3000,
      retryCheck: isWeavelFetchError
    };
    this.requestTimeout = options?.requestTimeout ?? 10000; // 10 seconds
    this.sdkIntegration = options?.sdkIntegration ?? "DEFAULT";
  }
  getSdkIntegration() {
    return this.sdkIntegration;
  }
  getCommonEventProperties() {
    return {
      $lib: this.getLibraryId(),
      $lib_version: this.getLibraryVersion()
    };
  }
  on(event, cb) {
    return this._events.on(event, cb);
  }
  debug(enabled = true) {
    this.removeDebugCallback?.();
    this.debugMode = enabled;
    if (enabled) {
      this.removeDebugCallback = this.on("*", (event, payload) => console.log("Weavel Debug", event, JSON.stringify(payload)));
    }
  }
  /***
   *** Handlers for each object type
   ***/
  sessionStateless(body) {
    const {
      session_id: bodyId,
      created_at: bodyCreatedAt,
      ...rest
    } = body;
    const session_id = bodyId ?? generateUUID();
    const parsedBody = {
      session_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest
    };
    this.enqueue("capture-session", parsedBody);
    return session_id;
  }
  identifyUserStateless(body) {
    const {
      created_at: bodyCreatedAt,
      ...rest
    } = body;
    const parsedBody = {
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest
    };
    this.enqueue("identify-user", parsedBody);
    return body.user_id;
  }
  messageStateless(body) {
    const {
      record_id: bodyId,
      ...rest
    } = body;
    const record_id = bodyId ?? generateUUID();
    const parsedBody = {
      record_id,
      ...rest
    };
    this.enqueue("capture-message", parsedBody);
    return record_id;
  }
  trackEventStateless(body) {
    const {
      record_id: bodyId,
      ...rest
    } = body;
    const record_id = bodyId ?? generateUUID();
    const parsedBody = {
      record_id,
      ...rest
    };
    this.enqueue("capture-track-event", parsedBody);
    return record_id;
  }
  traceStateless(body) {
    const {
      record_id: bodyId,
      ...rest
    } = body;
    const record_id = bodyId ?? generateUUID();
    const parsedBody = {
      record_id,
      ...rest
    };
    this.enqueue("capture-trace", parsedBody);
    return record_id;
  }
  spanStateless(body) {
    const {
      observation_id: bodyId,
      created_at: bodyCreatedAt,
      ...rest
    } = body;
    const observation_id = bodyId || generateUUID();
    const parsedBody = {
      observation_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest
    };
    this.enqueue("capture-span", parsedBody);
    return observation_id;
  }
  generationStateless(body) {
    const {
      observation_id: bodyId,
      created_at: bodyCreatedAt,
      ...rest
    } = body;
    const observation_id = bodyId || generateUUID();
    const parsedBody = {
      observation_id,
      created_at: bodyCreatedAt ?? new Date().toISOString(),
      ...rest
    };
    this.enqueue("capture-generation", parsedBody);
    return observation_id;
  }
  logStateless(body) {
    const {
      observation_id: bodyId,
      ...rest
    } = body;
    const observation_id = bodyId || generateUUID();
    const parsedBody = {
      observation_id,
      ...rest
    };
    this.enqueue("capture-log", parsedBody);
    return observation_id;
  }
  updateTraceStateless(body) {
    this.enqueue("update-trace", body);
    return body.record_id;
  }
  updateSpanStateless(body) {
    this.enqueue("update-span", body);
    return body.observation_id;
  }
  updateGenerationStateless(body) {
    this.enqueue("update-generation", body);
    return body.observation_id;
  }
  _parsePayload(response) {
    try {
      return JSON.parse(response);
    } catch {
      return response;
    }
  }
  /***
   *** QUEUEING AND FLUSHING
   ***/
  enqueue(type, body) {
    try {
      if (!this.enabled) {
        return;
      }
      try {
        JSON.stringify(body);
      } catch (e) {
        console.error(`Event Body for ${type} is not JSON-serializable: ${e}`);
        this._events.emit("error", `Event Body for ${type} is not JSON-serializable: ${e}`);
        return;
      }
      const queue = this.getPersistedProperty(exports.WeavelPersistedProperty.Queue) || [];
      queue.push({
        type,
        ...body
      });
      this.setPersistedProperty(exports.WeavelPersistedProperty.Queue, queue);
      this._events.emit(type, body);
      // Flush queued events if we meet the flushAt length
      if (queue.length >= this.flushAt) {
        this.flush();
      }
      if (this.flushInterval && !this._flushTimer) {
        this._flushTimer = safeSetTimeout(() => this.flush(), this.flushInterval);
      }
    } catch (e) {
      this._events.emit("error", e);
    }
  }
  /**
   * Asynchronously flushes all events that are not yet sent to the server.
   * This function always resolves, even if there were errors when flushing.
   * Errors are emitted as "error" events and the promise resolves.
   *
   * @returns {Promise<void>} A promise that resolves when the flushing is completed.
   */
  flushAsync() {
    return new Promise((resolve, _reject) => {
      try {
        this.flush((err, data) => {
          if (err) {
            console.error("Error while flushing Weavel", err);
            resolve();
          } else {
            resolve(data);
          }
        });
      } catch (e) {
        console.error("Error while flushing Weavel", e);
      }
    });
  }
  // Flushes all events that are not yet sent to the server
  flush(callback) {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
    const queue = this.getPersistedProperty(exports.WeavelPersistedProperty.Queue) || [];
    if (!queue.length) {
      return callback?.();
    }
    const items = queue.splice(0, this.flushAt);
    this.setPersistedProperty(exports.WeavelPersistedProperty.Queue, queue);
    const MAX_MSG_SIZE = 1_000_000;
    const BATCH_SIZE_LIMIT = 2_500_000;
    this.processQueueItems(items, MAX_MSG_SIZE, BATCH_SIZE_LIMIT);
    const promiseUUID = generateUUID();
    const done = err => {
      if (err) {
        this._events.emit("error", err);
      }
      callback?.(err, items);
      this._events.emit("flush", items);
    };
    const payload = JSON.stringify({
      batch: items,
      metadata: {
        batch_size: items.length,
        sdk_integration: this.sdkIntegration,
        sdk_version: this.getLibraryVersion(),
        sdk_variant: this.getLibraryId(),
        sdk_name: "weavel-js"
      }
    }); // implicit conversion also of dates to strings
    const url = `${this.baseUrl}/api/public/v2/batch`;
    const fetchOptions = this._getFetchOptions({
      method: "POST",
      body: payload
    });
    const requestPromise = this.fetchWithRetry(url, fetchOptions).then(() => done()).catch(err => {
      done(err);
    });
    this.pendingPromises[promiseUUID] = requestPromise;
    requestPromise.finally(() => {
      delete this.pendingPromises[promiseUUID];
    });
  }
  processQueueItems(queue, MAX_MSG_SIZE, BATCH_SIZE_LIMIT) {
    let totalSize = 0;
    const processedItems = [];
    const remainingItems = [];
    for (let i = 0; i < queue.length; i++) {
      try {
        const itemSize = new Blob([JSON.stringify(queue[i])]).size;
        // discard item if it exceeds the maximum size per event
        if (itemSize > MAX_MSG_SIZE) {
          console.warn(`Item exceeds size limit (size: ${itemSize}), dropping item.`);
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
    return {
      processedItems,
      remainingItems
    };
  }
  _getFetchOptions(p) {
    const fetchOptions = {
      method: p.method,
      headers: {
        "Content-Type": "application/json",
        "X-Weavel-Sdk-Name": "weavel-js",
        "X-Weavel-Sdk-Version": this.getLibraryVersion(),
        "X-Weavel-Sdk-Variant": this.getLibraryId(),
        "X-Weavel-Sdk-Integration": this.sdkIntegration,
        ...this.constructAuthorizationHeader(this.apiKey)
      },
      body: p.body
    };
    return fetchOptions;
  }
  constructAuthorizationHeader(apiKey) {
    return {
      Authorization: "Bearer " + apiKey
    };
  }
  async fetchWithRetry(url, options, retryOptions) {
    AbortSignal.timeout ??= function timeout(ms) {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), ms);
      return ctrl.signal;
    };
    return await retriable(async () => {
      let res = null;
      try {
        res = await this.fetch(url, {
          signal: AbortSignal.timeout(this.requestTimeout),
          ...options
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
    }, {
      ...this._retryOptions,
      ...retryOptions
    }, string => this._events.emit("retry", string + ", " + url + ", " + JSON.stringify(options)));
  }
  async shutdownAsync() {
    clearTimeout(this._flushTimer);
    try {
      await this.flushAsync();
      await Promise.all(Object.values(this.pendingPromises).map(x => x.catch(() => {
        // ignore errors as we are shutting down and can't deal with them anyways.
      })));
      // flush again in case there are new events that were added while we were waiting for the pending promises to resolve
      await this.flushAsync();
    } catch (e) {
      console.error("Error while shutting down Weavel", e);
    }
  }
  async awaitAllQueuedAndPendingRequests() {
    clearTimeout(this._flushTimer);
    await this.flushAsync();
    await Promise.all(Object.values(this.pendingPromises));
  }
}
class WeavelWebStateless extends WeavelCoreStateless {
  constructor(params) {
    const {
      flushAt,
      flushInterval,
      apiKey,
      enabled,
      ...rest
    } = params;
    let isObservabilityEnabled = enabled === false ? false : true;
    if (!isObservabilityEnabled) {
      console.warn("Weavel is disabled. No observability data will be sent to Weavel.");
    } else if (!apiKey) {
      isObservabilityEnabled = false;
      console.warn("Weavel API key not passed to constructor and not set as 'WEAVEL_API_KEY' environment variable. No observability data will be sent to Weavel.");
    }
    super({
      ...rest,
      apiKey,
      flushAt: flushAt ?? 1,
      flushInterval: flushInterval ?? 0,
      enabled: isObservabilityEnabled
    });
  }
  async identify(body) {
    this.identifyUserStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }
  async session(body) {
    const id = this.sessionStateless(body);
    const s = new WeavelWebSessionClient(this, id);
    await this.awaitAllQueuedAndPendingRequests();
    return s;
  }
  async track(body) {
    this.trackEventStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }
  async message(body) {
    this.messageStateless(body);
    await this.awaitAllQueuedAndPendingRequests();
    return this;
  }
}
class WeavelWebSessionClient {
  constructor(client, id) {
    this.client = client;
    this.id = id;
  }
  async track(body) {
    return this.client.track({
      session_id: this.id,
      ...body
    });
  }
  async message(body) {
    return this.client.message({
      session_id: this.id,
      ...body
    });
  }
}
class WeavelCore extends WeavelCoreStateless {
  constructor(params) {
    const {
      apiKey,
      enabled
    } = params;
    let isObservabilityEnabled = enabled === false ? false : true;
    if (!isObservabilityEnabled) {
      console.warn("Weavel is disabled. No observability data will be sent to Weavel.");
    } else if (!apiKey) {
      isObservabilityEnabled = false;
      console.warn("Weavel API key was not passed to constructor or not set as 'WEAVEL_API_KEY' environment variable. No observability data will be sent to Weavel.");
    }
    super({
      ...params,
      enabled: isObservabilityEnabled
    });
  }
  identify(body) {
    this.identifyUserStateless(body);
    return this;
  }
  session(body) {
    const id = this.sessionStateless(body);
    const s = new WeavelSessionClient(this, id);
    return s;
  }
  trace(body) {
    const id = this.traceStateless(body);
    const t = new WeavelTraceClient(this, id);
    return t;
  }
  span(body) {
    const id = this.spanStateless(body);
    return new WeavelSpanClient(this, id, body.record_id);
  }
  generation(body) {
    const id = this.generationStateless(body);
    return new WeavelGenerationClient(this, id, body.record_id);
  }
  log(body) {
    this.logStateless(body);
    return this;
  }
  _updateTrace(body) {
    this.updateTraceStateless(body);
    return this;
  }
  _updateSpan(body) {
    this.updateSpanStateless(body);
    return this;
  }
  _updateGeneration(body) {
    this.updateGenerationStateless(body);
    return this;
  }
}
class WeavelSessionClient {
  constructor(client, id) {
    this.client = client;
    this.id = id;
  }
  trace(body) {
    return this.client.trace({
      session_id: this.id,
      ...body
    });
  }
  span(body) {
    return this.client.span(body);
  }
  generation(body) {
    return this.client.generation(body);
  }
  log(body) {
    return this.client.log(body);
  }
}
class WeavelObjectClient {
  constructor({
    client,
    id,
    recordId,
    observationId
  }) {
    this.client = client;
    this.id = id;
    this.recordId = recordId;
    this.observationId = observationId;
  }
  span(body) {
    return this.client.span({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId
    });
  }
  log(body) {
    return this.client.log({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId
    });
  }
  generation(body) {
    return this.client.generation({
      ...body,
      record_id: this.recordId,
      parent_observation_id: this.observationId
    });
  }
}
class WeavelTraceClient extends WeavelObjectClient {
  constructor(client, recordId) {
    super({
      client,
      id: recordId,
      recordId,
      observationId: null
    });
  }
  update(body) {
    this.client._updateTrace({
      ...body,
      record_id: this.id
    });
    return this;
  }
  end(body) {
    this.client._updateTrace({
      ...body,
      record_id: this.id,
      ended_at: new Date().toISOString()
    });
    return this;
  }
}
class WeavelSpanClient extends WeavelObjectClient {
  constructor(client, id, recordId) {
    super({
      client,
      id,
      recordId,
      observationId: id
    });
  }
  update(body) {
    this.client._updateSpan({
      ...body,
      record_id: this.recordId,
      observation_id: this.id
    });
    return this;
  }
  end(body) {
    this.client._updateSpan({
      ...body,
      record_id: this.recordId,
      observation_id: this.id,
      ended_at: new Date().toISOString()
    });
    return this;
  }
}
class WeavelGenerationClient {
  constructor(client, id, recordId) {
    this.client = client;
    this.id = id;
    this.recordId = recordId;
  }
  update(body) {
    this.client._updateGeneration({
      ...body,
      record_id: this.recordId,
      observation_id: this.id
    });
    return this;
  }
  end(body) {
    this.client._updateGeneration({
      ...body,
      record_id: this.recordId,
      observation_id: this.id,
      ended_at: new Date().toISOString()
    });
    return this;
  }
}

exports.WeavelCore = WeavelCore;
exports.WeavelGenerationClient = WeavelGenerationClient;
exports.WeavelMemoryStorage = WeavelMemoryStorage;
exports.WeavelObjectClient = WeavelObjectClient;
exports.WeavelSessionClient = WeavelSessionClient;
exports.WeavelSpanClient = WeavelSpanClient;
exports.WeavelTraceClient = WeavelTraceClient;
exports.WeavelWebSessionClient = WeavelWebSessionClient;
exports.WeavelWebStateless = WeavelWebStateless;
exports.utils = utils;
//# sourceMappingURL=index.cjs.js.map
