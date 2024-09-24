import type OpenAI from 'openai';
import type { WeavelCoreOptions } from 'weavel-core';
import { WeavelSingleton } from './WeavelSingleton';

export type WeavelTraceConfig = {
  sessionId?: string;
  userId?: string;
  release?: string;
  version?: string;
  metadata?: Record<string, any>;
  tags?: string[];
};

export type WeavelConfig = {
  generationName?: string;
  metadata?: Record<string, any>;
  promptName?: string;
  clientInitParams: WeavelCoreOptions;
};

export type WeavelExtension = OpenAI &
  Pick<ReturnType<typeof WeavelSingleton.getInstance>, 'flushAsync'>;
