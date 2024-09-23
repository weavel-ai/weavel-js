import type OpenAI from 'openai';
import { WeavelSingleton } from './WeavelSingleton';
import {
  getToolCallOutput,
  parseChunk,
  parseCompletionOutput,
  parseInputArgs,
} from './parseOpenAI';
import { isAsyncIterable } from './utils';
import type { WeavelConfig } from './types';
import { CaptureGenerationBody } from 'weavel-core';

type GenericMethod = (...args: unknown[]) => unknown;

export const withTracing = <T extends GenericMethod>(
  tracedMethod: T,
  config?: WeavelConfig & Required<{ generationName: string }>
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return (...args) => wrapMethod(tracedMethod, config, ...args);
};

const wrapMethod = async <T extends GenericMethod>(
  tracedMethod: T,
  config?: WeavelConfig,
  ...args: Parameters<T>
): Promise<ReturnType<T> | any> => {
  console.log('Starting wrapMethod');
  try {
    const { model, input } = parseInputArgs(args[0] ?? {});
    console.log('Parsed input args:', { model, input });

    let observationData: CaptureGenerationBody = {
      name: config?.generationName ?? 'OpenAI Generation',
      prompt_name: config?.promptName ?? null,
      inputs: input,
      messages:
        typeof input === 'object' && 'messages' in input
          ? input.messages
          : null,
      model: model,
    };
    console.log('Created observationData:', observationData);

    const weavel = WeavelSingleton.getInstance(config?.clientInitParams);
    console.log('Got Weavel instance');

    try {
      console.log('Calling tracedMethod');
      const res = await tracedMethod(...args);
      console.log('tracedMethod result:', res);

      if (isAsyncIterable(res)) {
        console.log('Result is AsyncIterable');
        async function* tracedOutputGenerator(): AsyncGenerator<
          unknown,
          void,
          unknown
        > {
          const response = res;
          const textChunks: string[] = [];
          const toolCallChunks: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[] =
            [];
          let completionStartTime: Date | null = null;

          for await (const rawChunk of response as AsyncIterable<unknown>) {
            completionStartTime = completionStartTime ?? new Date();

            console.log('Processing chunk:', rawChunk);
            const processedChunk = parseChunk(rawChunk);
            console.log('Processed chunk:', processedChunk);

            if (!processedChunk.isToolCall) {
              textChunks.push(processedChunk.data);
            } else {
              toolCallChunks.push(processedChunk.data);
            }

            yield rawChunk;
          }

          const output =
            toolCallChunks.length > 0
              ? getToolCallOutput(toolCallChunks)
              : textChunks.join('');
          console.log('Final output:', output);

          console.log('Calling weavel.generation');
          weavel.generation({
            ...observationData,
            outputs: [output],
          });
        }

        return tracedOutputGenerator() as ReturnType<T>;
      }

      console.log('Result is not AsyncIterable');
      const output = parseCompletionOutput(res);
      console.log('Parsed completion output:', output);

      console.log('Calling weavel.generation');
      weavel.generation({
        ...observationData,
        outputs: [output],
      });

      return res;
    } catch (error) {
      console.error('Error in tracedMethod:', error);
      console.log('Calling weavel.generation with error');
      weavel.generation({
        ...observationData,
      });

      throw error;
    }
  } catch (error) {
    console.error('Error in wrapMethod:', error);
    throw error;
  }
};
