/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */
interface paths {
    "/public/v2/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Capture Batch
         * @description Batch Execution of POST APIs
         */
        post: operations["capture_batch_public_v2_batch_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
type webhooks = Record<string, never>;
interface components {
    schemas: {
        /**
         * BatchRequestBody
         * @description Represents a batch request body containing a list of requests.
         *
         *     Attributes:
         *         batch (List[Union[CaptureSessionRequest, IdentifyUserRequest, CaptureMessageRequest,
         *                           CaptureTrackEventRequest, CaptureTraceRequest, CaptureSpanRequest,
         *                           CaptureLogRequest, CaptureGenerationRequest, UpdateTraceRequest,
         *                           UpdateSpanRequest, UpdateGenerationRequest]]):
         *             The list of requests to be processed in the batch.
         */
        BatchRequestBody: {
            /** Batch */
            batch: (components["schemas"]["CaptureSessionRequest"] | components["schemas"]["IdentifyUserRequest"] | components["schemas"]["CaptureMessageRequest"] | components["schemas"]["CaptureTrackEventRequest"] | components["schemas"]["CaptureTraceRequest"] | components["schemas"]["CaptureSpanRequest"] | components["schemas"]["CaptureLogRequest"] | components["schemas"]["CaptureGenerationRequest"] | components["schemas"]["UpdateTraceRequest"] | components["schemas"]["UpdateSpanRequest"] | components["schemas"]["UpdateGenerationRequest"])[];
        };
        /**
         * CaptureGenerationBody
         * @description Represents the body of a capture generation.
         *
         *     Attributes:
         *         inputs (Optional[Dict[str, Any]]): The inputs of the generation. Optional.
         *         outputs (Optional[Dict[str, Any]]): The outputs of the generation. Optional.
         */
        CaptureGenerationBody: {
            /**
             * Record Id
             * @description The unique identifier for the record.
             */
            record_id: string;
            /**
             * Created At
             * @description The datetime when the observation was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Name
             * @description The name of the observation. Optional.
             */
            name: string;
            /**
             * Parent Observation Id
             * @description The parent observation ID. Optional.
             */
            parent_observation_id?: string | null;
            /**
             * Observation Id
             * @description The unique identifier for the observation. Optional.
             */
            observation_id?: string | null;
            /**
             * Inputs
             * @description The inputs of the generation. Optional.
             */
            inputs?: Record<string, never> | null;
            /**
             * Outputs
             * @description The outputs of the generation. Optional.
             */
            outputs?: Record<string, never> | null;
        };
        /**
         * CaptureGenerationRequest
         * @description Represents a request for capture generation.
         *
         *     Attributes:
         *         type (Literal[IngestionType.CaptureGeneration]): The type of ingestion, which is set to IngestionType.CaptureGeneration.
         *         body (CaptureGenerationBody): The body of the capture generation request.
         */
        CaptureGenerationRequest: {
            /**
             * Type
             * @default capture-generation
             * @constant
             * @enum {string}
             */
            type: "capture-generation";
            body: components["schemas"]["CaptureGenerationBody"];
        };
        /**
         * CaptureLogBody
         * @description Represents the body of a capture log observation.
         *
         *     Attributes:
         *         value (str, optional): The value of the observation. Optional.
         */
        CaptureLogBody: {
            /**
             * Record Id
             * @description The unique identifier for the record.
             */
            record_id: string;
            /**
             * Created At
             * @description The datetime when the observation was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Name
             * @description The name of the observation. Optional.
             */
            name: string;
            /**
             * Parent Observation Id
             * @description The parent observation ID. Optional.
             */
            parent_observation_id?: string | null;
            /**
             * Observation Id
             * @description The unique identifier for the observation. Optional.
             */
            observation_id?: string | null;
            /**
             * Value
             * @description The value of the observation. Optional.
             */
            value?: string | null;
        };
        /**
         * CaptureLogRequest
         * @description Represents a request to capture log data.
         *
         *     Attributes:
         *         type (Literal[IngestionType.CaptureLog]): The type of ingestion, set to IngestionType.CaptureLog.
         *         body (CaptureLogBody): The body of the capture log request.
         */
        CaptureLogRequest: {
            /**
             * Type
             * @default capture-log
             * @constant
             * @enum {string}
             */
            type: "capture-log";
            body: components["schemas"]["CaptureLogBody"];
        };
        /**
         * CaptureMessageBody
         * @description Represents a capture message body.
         *
         *     Attributes:
         *         role (Literal["user", "assistant", "system"]): The role of the session, can be 'user', 'assistant', or 'system'.
         *         content (str): The content of the record.
         */
        CaptureMessageBody: {
            /**
             * Session Id
             * @description The unique identifier for the record.
             */
            session_id: string;
            /**
             * Record Id
             * @description The unique identifier for the record. Optional.
             */
            record_id?: string | null;
            /**
             * Created At
             * @description The datetime when the record was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Metadata
             * @description Additional metadata associated with the record. Optional.
             */
            metadata?: Record<string, never> | null;
            /**
             * Ref Record Id
             * @description The record ID to reference. Optional.
             */
            ref_record_id?: string | null;
            /**
             * Role
             * @description The role of the session, 'user', 'assistant', 'system'.
             * @enum {string}
             */
            role: "user" | "assistant" | "system";
            /**
             * Content
             * @description The content of the record.
             */
            content: string;
        };
        /**
         * CaptureMessageRequest
         * @description Represents a request to capture a message.
         *
         *     Attributes:
         *         type (Literal[IngestionType.CaptureMessage]): The type of ingestion, which is set to IngestionType.CaptureMessage.
         *         body (CaptureMessageBody): The body of the capture message request.
         */
        CaptureMessageRequest: {
            /**
             * Type
             * @default capture-message
             * @constant
             * @enum {string}
             */
            type: "capture-message";
            body: components["schemas"]["CaptureMessageBody"];
        };
        /**
         * CaptureSpanBody
         * @description Represents the body of a capture span observation.
         *
         *     Attributes:
         *         inputs (Optional[Dict[str, Any]]): The inputs of the generation. Optional.
         *         outputs (Optional[Dict[str, Any]]): The outputs of the generation. Optional.
         */
        CaptureSpanBody: {
            /**
             * Record Id
             * @description The unique identifier for the record.
             */
            record_id: string;
            /**
             * Created At
             * @description The datetime when the observation was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Name
             * @description The name of the observation. Optional.
             */
            name: string;
            /**
             * Parent Observation Id
             * @description The parent observation ID. Optional.
             */
            parent_observation_id?: string | null;
            /**
             * Observation Id
             * @description The unique identifier for the observation. Optional.
             */
            observation_id?: string | null;
            /**
             * Inputs
             * @description The inputs of the generation. Optional.
             */
            inputs?: Record<string, never> | null;
            /**
             * Outputs
             * @description The outputs of the generation. Optional.
             */
            outputs?: Record<string, never> | null;
        };
        /**
         * CaptureSpanRequest
         * @description Represents a request to capture a span.
         *
         *     Attributes:
         *         type (Literal[IngestionType.CaptureSpan]): The type of ingestion, set to IngestionType.CaptureSpan.
         *         body (CaptureSpanBody): The body of the capture span request.
         */
        CaptureSpanRequest: {
            /**
             * Type
             * @default capture-span
             * @constant
             * @enum {string}
             */
            type: "capture-span";
            body: components["schemas"]["CaptureSpanBody"];
        };
        /**
         * CaptureTraceBody
         * @description Represents the body of a capture trace record.
         *
         *     Attributes:
         *         name (str): The name of the record. Optional.
         */
        CaptureTraceBody: {
            /**
             * Session Id
             * @description The unique identifier for the record.
             */
            session_id: string;
            /**
             * Record Id
             * @description The unique identifier for the record. Optional.
             */
            record_id?: string | null;
            /**
             * Created At
             * @description The datetime when the record was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Metadata
             * @description Additional metadata associated with the record. Optional.
             */
            metadata?: Record<string, never> | null;
            /**
             * Ref Record Id
             * @description The record ID to reference. Optional.
             */
            ref_record_id?: string | null;
            /**
             * Name
             * @description The name of the record. Optional.
             */
            name: string;
        };
        /**
         * CaptureTraceRequest
         * @description Represents a request to capture a trace.
         *
         *     Attributes:
         *         type (Literal[IngestionType.CaptureTrace]): The type of ingestion, set to IngestionType.CaptureTrace.
         *         body (CaptureTraceBody): The body of the capture trace request.
         */
        CaptureTraceRequest: {
            /**
             * Type
             * @default capture-trace
             * @constant
             * @enum {string}
             */
            type: "capture-trace";
            body: components["schemas"]["CaptureTraceBody"];
        };
        /**
         * CaptureTrackEventBody
         * @description Represents the body of a capture track event.
         *
         *     Attributes:
         *         name (str): The name of the record. Optional.
         *         properties (Optional[Dict[str, Any]]): Additional properties associated with the record. Optional.
         */
        CaptureTrackEventBody: {
            /**
             * Session Id
             * @description The unique identifier for the record.
             */
            session_id: string;
            /**
             * Record Id
             * @description The unique identifier for the record. Optional.
             */
            record_id?: string | null;
            /**
             * Created At
             * @description The datetime when the record was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Metadata
             * @description Additional metadata associated with the record. Optional.
             */
            metadata?: Record<string, never> | null;
            /**
             * Ref Record Id
             * @description The record ID to reference. Optional.
             */
            ref_record_id?: string | null;
            /**
             * Name
             * @description The name of the record. Optional.
             */
            name: string;
            /**
             * Properties
             * @description Additional properties associated with the record. Optional.
             */
            properties?: Record<string, never> | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /**
         * IdentifyUserBody
         * @description Represents the body of a request to identify a user.
         *
         *     Attributes:
         *         user_id (str): The unique identifier for the user.
         *         properties (Dict[str, Any], optional): Additional properties associated with the track event. Optional.
         *         created_at (Optional[str], optional): The datetime when the User is identified. Optional.
         */
        IdentifyUserBody: {
            /**
             * User Id
             * @description The unique identifier for the user.
             */
            user_id: string;
            /**
             * Properties
             * @description Additional properties associated with the track event. Optional.
             */
            properties: Record<string, never>;
            /**
             * Created At
             * @description The datetime when the User is identified. Optional.
             */
            created_at?: string | null;
        };
        /**
         * CaptureSessionBody
         * @description Represents the request body for capturing a session.
         *
         *     Attributes:
         *         user_id (str): The unique identifier for the user.
         *         session_id (str): The unique identifier for the session data.
         *         metadata (Optional[Dict[str, str]]): Additional metadata associated with the session. Optional.
         *         created_at (Optional[str]): The datetime when the session was opened. Optional.
         */
        CaptureSessionBody: {
            /**
             * User Id
             * @description The unique identifier for the user.
             */
            user_id: string;
            /**
             * Session Id
             * @description The unique identifier for the session data.
             */
            session_id?: string | null;
            /**
             * Metadata
             * @description Additional metadata associated with the session. Optional.
             */
            metadata?: {
                [key: string]: string | undefined;
            } | null;
            /**
             * Created At
             * @description The datetime when the session was opened. Optional.
             */
            created_at?: string | null;
        };
        /**
         * CaptureSessionRequest
         * @description Represents a request to capture a session.
         *
         *     Attributes:
         *         type (Literal[IngestionType.OpenSession]): The type of ingestion, set to IngestionType.OpenSession.
         *         body (OpenSessionBody): The body of the open session request.
         */
        CaptureSessionRequest: {
            /**
             * Type
             * @default capture-session
             * @constant
             * @enum {string}
             */
            type: "capture-session";
            body: components["schemas"]["CaptureSessionBody"];
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /**
         * CaptureTrackEventRequest
         * @description Represents a request to capture a track event.
         *
         *     Attributes:
         *         type (Literal[IngestionType.CaptureTrackEvent]): The type of ingestion, set to IngestionType.CaptureTrackEvent.
         *         body (CaptureTrackEventBody): The body of the capture track event request.
         */
        CaptureTrackEventRequest: {
            /**
             * Type
             * @default capture-track-event
             * @constant
             * @enum {string}
             */
            type: "capture-track-event";
            body: components["schemas"]["CaptureTrackEventBody"];
        };
        /** UpdateTraceBody */
        UpdateTraceBody: {
            /**
             * Session Id
             * @description The unique identifier for the record.
             */
            session_id?: string | null;
            /** Record Id */
            record_id: string;
            /**
             * Created At
             * @description The datetime when the record was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Metadata
             * @description Additional metadata associated with the record. Optional.
             */
            metadata?: Record<string, never> | null;
            /**
             * Ref Record Id
             * @description The record ID to reference. Optional.
             */
            ref_record_id?: string | null;
            /** Ended At */
            ended_at: string | null;
        };
        /** UpdateTraceRequest */
        UpdateTraceRequest: {
            /**
             * Type
             * @default update-trace
             * @constant
             * @enum {string}
             */
            type: "update-trace";
            body: components["schemas"]["UpdateTraceBody"];
        };
        /** UpdateSpanBody */
        UpdateSpanBody: {
            /**
             * Record Id
             * @description The unique identifier for the record.
             */
            record_id?: string | null;
            /**
             * Created At
             * @description The datetime when the observation was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Name
             * @description The name of the observation. Optional.
             */
            name: string;
            /**
             * Parent Observation Id
             * @description The parent observation ID. Optional.
             */
            parent_observation_id?: string | null;
            /** Observation Id */
            observation_id: string;
            /** Ended At */
            ended_at: string | null;
            /** Inputs */
            inputs: Record<string, never> | null;
            /** Outputs */
            outputs: Record<string, never> | null;
        };
        /** UpdateSpanRequest */
        UpdateSpanRequest: {
            /**
             * Type
             * @default update-span
             * @constant
             * @enum {string}
             */
            type: "update-span";
            body: components["schemas"]["UpdateSpanBody"];
        };
        /** UpdateGenerationBody */
        UpdateGenerationBody: {
            /**
             * Record Id
             * @description The unique identifier for the record.
             */
            record_id?: string | null;
            /**
             * Created At
             * @description The datetime when the observation was captured. Optional.
             */
            created_at?: string | null;
            /**
             * Name
             * @description The name of the observation. Optional.
             */
            name: string;
            /**
             * Parent Observation Id
             * @description The parent observation ID. Optional.
             */
            parent_observation_id?: string | null;
            /** Observation Id */
            observation_id: string;
            /** Ended At */
            ended_at: string | null;
            /** Inputs */
            inputs: Record<string, never> | null;
            /** Outputs */
            outputs: Record<string, never> | null;
        };
        /** UpdateGenerationRequest */
        UpdateGenerationRequest: {
            /**
             * Type
             * @default update-generation
             * @constant
             * @enum {string}
             */
            type: "update-generation";
            body: components["schemas"]["UpdateGenerationBody"];
        };
        /**
         * IdentifyUserRequest
         * @description Represents a request to identify a user.
         *
         *     Attributes:
         *         type (Literal[IngestionType.IdentifyUser]): The type of ingestion, which is set to IngestionType.IdentifyUser.
         *         body (IdentifyUserBody): The body of the identification request.
         */
        IdentifyUserRequest: {
            /**
             * Type
             * @default identify-user
             * @constant
             * @enum {string}
             */
            type: "identify-user";
            body: components["schemas"]["IdentifyUserBody"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
type $defs = Record<string, never>;
interface operations {
    capture_batch_public_v2_batch_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BatchRequestBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}

type WeavelCoreOptions = {
    apiKey?: string;
    baseUrl?: string;
    flushAt?: number;
    flushInterval?: number;
    fetchRetryCount?: number;
    fetchRetryDelay?: number;
    requestTimeout?: number;
    release?: string;
    sdkIntegration?: string;
    enabled?: boolean;
};
declare enum WeavelPersistedProperty {
    Props = "props",
    Queue = "queue",
    OptedOut = "opted_out"
}
type WeavelFetchOptions = {
    method: "GET" | "POST" | "PUT" | "PATCH";
    headers: {
        [key: string]: string;
    };
    body?: string;
    signal?: AbortSignal;
};
type WeavelFetchResponse<T = any> = {
    status: number;
    text: () => Promise<string>;
    json: () => Promise<T>;
};
type IngestionType = SingleIngestionEvent["type"];
type WeavelQueueItem = SingleIngestionEvent & {
    callback?: (err: any) => void;
};
type SingleIngestionEvent = paths["/public/v2/batch"]["post"]["requestBody"]["content"]["application/json"]["batch"][number];
type BatchRequestBody = FixTypes<components["schemas"]["BatchRequestBody"]>;
type IdentifyUserBody = FixTypes<components["schemas"]["IdentifyUserBody"]>;
type CaptureSessionBody = FixTypes<components["schemas"]["CaptureSessionBody"]>;
type CaptureMessageBody = FixTypes<components["schemas"]["CaptureMessageBody"]>;
type CaptureTrackEventBody = FixTypes<components["schemas"]["CaptureTrackEventBody"]>;
type CaptureTraceBody = FixTypes<components["schemas"]["CaptureTraceBody"]>;
type CaptureSpanBody = FixTypes<components["schemas"]["CaptureSpanBody"]>;
type CaptureLogBody = FixTypes<components["schemas"]["CaptureLogBody"]>;
type CaptureGenerationBody = FixTypes<components["schemas"]["CaptureGenerationBody"]>;
type UpdateTraceBody = FixTypes<components["schemas"]["UpdateTraceBody"]>;
type UpdateSpanBody = FixTypes<components["schemas"]["UpdateSpanBody"]>;
type UpdateGenerationBody = FixTypes<components["schemas"]["UpdateGenerationBody"]>;
type JsonType = string | number | boolean | null | {
    [key: string]: JsonType;
} | Array<JsonType>;
type OptionalTypes<T> = T extends null | undefined ? T : never;
type FixTypes<T> = Omit<{
    [P in keyof T]: P extends "startTime" | "endTime" | "timestamp" | "completionStartTime" | "createdAt" | "updatedAt" ? // Dates instead of strings
    Date | OptionalTypes<T[P]> : P extends "metadata" | "input" | "output" | "completion" | "expectedOutput" ? // JSON instead of strings
    any | OptionalTypes<T[P]> : T[P];
}, "externalId" | "traceIdType">;
type DeferRuntime = {
    weavelTraces: (traces: {
        id: string;
        name: string;
        url: string;
    }[]) => void;
};

declare function assert(truthyValue: any, message: string): void;
declare function removeTrailingSlash(url: string): string;
type RetriableOptions = {
    retryCount?: number;
    retryDelay?: number;
    retryCheck?: (err: any) => boolean;
};
declare function retriable<T>(fn: () => Promise<T>, props: RetriableOptions | undefined, log: (msg: string) => void): Promise<T>;
declare function generateUUID(globalThis?: any): string;
declare function currentTimestamp(): number;
declare function currentISOTime(): string;
declare function safeSetTimeout(fn: () => void, timeout: number): any;
declare function getEnv<T = string>(key: string): T | undefined;
declare function configWeavelSDK(params?: WeavelCoreOptions): WeavelCoreOptions;
declare const encodeQueryParams: (params?: {
    [key: string]: any;
}) => string;

type utils_d_RetriableOptions = RetriableOptions;
declare const utils_d_assert: typeof assert;
declare const utils_d_configWeavelSDK: typeof configWeavelSDK;
declare const utils_d_currentISOTime: typeof currentISOTime;
declare const utils_d_currentTimestamp: typeof currentTimestamp;
declare const utils_d_encodeQueryParams: typeof encodeQueryParams;
declare const utils_d_generateUUID: typeof generateUUID;
declare const utils_d_getEnv: typeof getEnv;
declare const utils_d_removeTrailingSlash: typeof removeTrailingSlash;
declare const utils_d_retriable: typeof retriable;
declare const utils_d_safeSetTimeout: typeof safeSetTimeout;
declare namespace utils_d {
  export { type utils_d_RetriableOptions as RetriableOptions, utils_d_assert as assert, utils_d_configWeavelSDK as configWeavelSDK, utils_d_currentISOTime as currentISOTime, utils_d_currentTimestamp as currentTimestamp, utils_d_encodeQueryParams as encodeQueryParams, utils_d_generateUUID as generateUUID, utils_d_getEnv as getEnv, utils_d_removeTrailingSlash as removeTrailingSlash, utils_d_retriable as retriable, utils_d_safeSetTimeout as safeSetTimeout };
}

declare class SimpleEventEmitter {
    events: {
        [key: string]: ((...args: any[]) => void)[];
    };
    constructor();
    on(event: string, listener: (...args: any[]) => void): () => void;
    emit(event: string, payload: any): void;
}

declare class WeavelMemoryStorage {
    private _memoryStorage;
    getProperty(key: WeavelPersistedProperty): any | undefined;
    setProperty(key: WeavelPersistedProperty, value: any | null): void;
}

declare abstract class WeavelCoreStateless {
    private apiKey;
    baseUrl: string;
    private flushAt;
    private flushInterval;
    private requestTimeout;
    private removeDebugCallback?;
    private debugMode;
    private pendingPromises;
    private release;
    private sdkIntegration;
    private enabled;
    protected _options: WeavelCoreOptions;
    protected _events: SimpleEventEmitter;
    protected _flushTimer?: any;
    protected _retryOptions: RetriableOptions;
    abstract fetch(url: string, options: WeavelFetchOptions): Promise<WeavelFetchResponse>;
    abstract getLibraryId(): string;
    abstract getLibraryVersion(): string;
    abstract getPersistedProperty<T>(key: WeavelPersistedProperty): T | undefined;
    abstract setPersistedProperty<T>(key: WeavelPersistedProperty, value: T | null): void;
    constructor(params: WeavelCoreOptions);
    getSdkIntegration(): string;
    protected getCommonEventProperties(): any;
    on(event: string, cb: (...args: any[]) => void): () => void;
    debug(enabled?: boolean): void;
    /***
     *** Handlers for each object type
     ***/
    protected sessionStateless(body: CaptureSessionBody): string;
    protected identifyUserStateless(body: IdentifyUserBody): string;
    protected messageStateless(body: CaptureMessageBody): string;
    protected trackEventStateless(body: CaptureTrackEventBody): string;
    protected traceStateless(body: CaptureTraceBody): string;
    protected spanStateless(body: CaptureSpanBody): string;
    protected generationStateless(body: CaptureGenerationBody): string;
    protected logStateless(body: CaptureLogBody): string;
    protected updateTraceStateless(body: UpdateTraceBody): string;
    protected updateSpanStateless(body: UpdateSpanBody): string;
    protected updateGenerationStateless(body: UpdateGenerationBody): string;
    protected _parsePayload(response: any): any;
    /***
     *** QUEUEING AND FLUSHING
     ***/
    protected enqueue(type: IngestionType, body: any): void;
    /**
     * Asynchronously flushes all events that are not yet sent to the server.
     * This function always resolves, even if there were errors when flushing.
     * Errors are emitted as "error" events and the promise resolves.
     *
     * @returns {Promise<void>} A promise that resolves when the flushing is completed.
     */
    flushAsync(): Promise<void>;
    flush(callback?: (err?: any, data?: any) => void): void;
    processQueueItems(queue: WeavelQueueItem[], MAX_MSG_SIZE: number, BATCH_SIZE_LIMIT: number): {
        processedItems: WeavelQueueItem[];
        remainingItems: WeavelQueueItem[];
    };
    _getFetchOptions(p: {
        method: WeavelFetchOptions["method"];
        body?: WeavelFetchOptions["body"];
    }): WeavelFetchOptions;
    private constructAuthorizationHeader;
    private fetchWithRetry;
    shutdownAsync(): Promise<void>;
    protected awaitAllQueuedAndPendingRequests(): Promise<void>;
}
declare abstract class WeavelWebStateless extends WeavelCoreStateless {
    constructor(params: WeavelCoreOptions);
    identify(body: IdentifyUserBody): Promise<this>;
    session(body: CaptureSessionBody): Promise<WeavelWebSessionClient>;
    track(body: CaptureTrackEventBody): Promise<this>;
    message(body: CaptureMessageBody): Promise<this>;
}
declare class WeavelWebSessionClient {
    readonly client: WeavelWebStateless;
    readonly id: string;
    constructor(client: WeavelWebStateless, id: string);
    track(body: Omit<CaptureTrackEventBody, "session_id">): Promise<WeavelWebStateless>;
    message(body: Omit<CaptureMessageBody, "session_id">): Promise<WeavelWebStateless>;
}
declare abstract class WeavelCore extends WeavelCoreStateless {
    constructor(params: WeavelCoreOptions);
    identify(body: IdentifyUserBody): this;
    session(body: CaptureSessionBody): WeavelSessionClient;
    trace(body: CaptureTraceBody): WeavelTraceClient;
    span(body: CaptureSpanBody): WeavelSpanClient;
    generation(body: CaptureGenerationBody): WeavelGenerationClient;
    log(body: CaptureLogBody): this;
    _updateTrace(body: UpdateTraceBody): this;
    _updateSpan(body: UpdateSpanBody): this;
    _updateGeneration(body: UpdateGenerationBody): this;
}
declare class WeavelSessionClient {
    readonly client: WeavelCore;
    readonly id: string;
    constructor(client: WeavelCore, id: string);
    trace(body: Omit<CaptureTraceBody, "session_id">): WeavelTraceClient;
    span(body: CaptureSpanBody): WeavelSpanClient;
    generation(body: CaptureGenerationBody): WeavelGenerationClient;
    log(body: CaptureLogBody): WeavelCore;
}
declare abstract class WeavelObjectClient {
    readonly client: WeavelCore;
    readonly id: string;
    readonly recordId: string;
    readonly observationId: string | null;
    constructor({ client, id, recordId, observationId, }: {
        client: WeavelCore;
        id: string;
        recordId: string;
        observationId: string | null;
    });
    span(body: Omit<CaptureSpanBody, "record_id" | "parent_observation_id">): WeavelSpanClient;
    log(body: Omit<CaptureLogBody, "record_id" | "parent_observation_id">): WeavelCore;
    generation(body: Omit<CaptureGenerationBody, "record_id" | "parent_observation_id">): WeavelGenerationClient;
}
declare class WeavelTraceClient extends WeavelObjectClient {
    constructor(client: WeavelCore, recordId: string);
    update(body: Omit<UpdateTraceBody, "record_id">): this;
    end(body?: Omit<UpdateTraceBody, "record_id" | "ended_at">): this;
}
declare class WeavelSpanClient extends WeavelObjectClient {
    constructor(client: WeavelCore, id: string, recordId: string);
    update(body: Omit<UpdateSpanBody, "observation_id" | "record_id">): this;
    end(body: Omit<UpdateSpanBody, "observation_id" | "ended_at">): this;
}
declare class WeavelGenerationClient {
    readonly client: WeavelCore;
    readonly id: string;
    readonly recordId: string;
    constructor(client: WeavelCore, id: string, recordId: string);
    update(body: Omit<UpdateGenerationBody, "observation_id" | "record_id">): this;
    end(body: Omit<UpdateGenerationBody, "observation_id" | "ended_at">): this;
}

export { type $defs, type BatchRequestBody, type CaptureGenerationBody, type CaptureLogBody, type CaptureMessageBody, type CaptureSessionBody, type CaptureSpanBody, type CaptureTraceBody, type CaptureTrackEventBody, type DeferRuntime, type IdentifyUserBody, type IngestionType, type JsonType, type SingleIngestionEvent, type UpdateGenerationBody, type UpdateSpanBody, type UpdateTraceBody, WeavelCore, type WeavelCoreOptions, type WeavelFetchOptions, type WeavelFetchResponse, WeavelGenerationClient, WeavelMemoryStorage, WeavelObjectClient, WeavelPersistedProperty, type WeavelQueueItem, WeavelSessionClient, WeavelSpanClient, WeavelTraceClient, WeavelWebSessionClient, WeavelWebStateless, type components, type operations, type paths, utils_d as utils, type webhooks };