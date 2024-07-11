import { type components, type paths } from './openapi/server';

export type WeavelCoreOptions = {
  // Weavel API key obtained from the dashboard project settings
  apiKey?: string;
  // Weavel API baseUrl (https://api.weavel.ai by default)
  baseUrl?: string;
  // The number of events to queue before sending to Weavel (flushing)
  flushAt?: number;
  // The interval in milliseconds between periodic flushes
  flushInterval?: number;
  // How many times we will retry HTTP requests
  fetchRetryCount?: number;
  // The delay between HTTP request retries
  fetchRetryDelay?: number;
  // Timeout in milliseconds for any calls. Defaults to 10 seconds.
  requestTimeout?: number;
  // release (version) of the application, defaults to env WEAVEL_RELEASE
  release?: string;
  // integration type of the SDK.
  sdkIntegration?: string; // DEFAULT, LANGCHAIN, or any other custom value
  // Enabled switch for the SDK. If disabled, no observability data will be sent to Weavel. Defaults to true.
  enabled?: boolean;
};

export enum WeavelPersistedProperty {
  Props = 'props',
  Queue = 'queue',
  OptedOut = 'opted_out',
}

export type WeavelFetchOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers: { [key: string]: string };
  body?: string;
  signal?: AbortSignal;
};

export type WeavelFetchResponse<T = any> = {
  status: number;
  text: () => Promise<string>;
  json: () => Promise<T>;
};

export type IngestionType = SingleIngestionEvent['type'];

export type WeavelQueueItem = SingleIngestionEvent & {
  callback?: (err: any) => void;
};

export type SingleIngestionEvent =
  paths['/public/v2/batch']['post']['requestBody']['content']['application/json']['batch'][number];

// ASYNC
export type BatchRequestBody = FixTypes<
  components['schemas']['BatchRequestBody']
>;

export type IdentifyUserBody = FixTypes<
  components['schemas']['IdentifyUserBody']
>;
export type CaptureSessionBody = FixTypes<
  components['schemas']['CaptureSessionBody']
>;

export type CaptureMessageBody = FixTypes<
  components['schemas']['CaptureMessageBody']
>;
export type CaptureTrackEventBody = FixTypes<
  components['schemas']['CaptureTrackEventBody']
>;
export type CaptureTraceBody = FixTypes<
  components['schemas']['CaptureTraceBody']
>;

export type CaptureSpanBody = FixTypes<
  components['schemas']['CaptureSpanBody']
>;
export type CaptureLogBody = FixTypes<components['schemas']['CaptureLogBody']>;
export type CaptureGenerationBody = FixTypes<
  components['schemas']['CaptureGenerationBody']
>;

export type UpdateTraceBody = FixTypes<
  components['schemas']['UpdateTraceBody']
>;
export type UpdateSpanBody = FixTypes<components['schemas']['UpdateSpanBody']>;
export type UpdateGenerationBody = FixTypes<
  components['schemas']['UpdateGenerationBody']
>;

export type JsonType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonType }
  | Array<JsonType>;

type OptionalTypes<T> = T extends null | undefined ? T : never;
type FixTypes<T> = Omit<
  {
    [P in keyof T]: P extends
      | 'startTime'
      | 'endTime'
      | 'timestamp'
      | 'completionStartTime'
      | 'createdAt'
      | 'updatedAt'
      ? // Dates instead of strings
        Date | OptionalTypes<T[P]>
      : P extends
            | 'metadata'
            | 'input'
            | 'output'
            | 'completion'
            | 'expectedOutput'
        ? // JSON instead of strings
          any | OptionalTypes<T[P]>
        : T[P];
  },
  'externalId' | 'traceIdType'
>;

export type DeferRuntime = {
  weavelTraces: (
    traces: {
      id: string;
      name: string;
      url: string;
    }[]
  ) => void;
};
