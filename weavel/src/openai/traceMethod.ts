import type OpenAI from 'openai';
import { WeavelSingleton } from './WeavelSingleton';
import {
  getToolCallOutput,
  parseChunk,
  parseCompletionOutput,
  parseInputArgs,
  parseUsage,
} from './parseOpenAI';
import { isAsyncIterable } from './utils';
import type { WeavelConfig } from './types';
import { CaptureGenerationBody } from 'weavel-core';

const pricing: { [key: string]: { input: number; output: number } } = {
  'gpt-4o': { input: 0.000005, output: 0.000015 },
  'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  'gpt-4o-mini-2024-07-18': { input: 0.00000015, output: 0.0000006 },
  'o1-mini': { input: 0.000003, output: 0.000012 },
  'o1-preview': { input: 0.000015, output: 0.00006 },
};

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
  try {
    const { model, input, modelParameters } = parseInputArgs(args[0] ?? {});

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

    const weavel = WeavelSingleton.getInstance(config?.clientInitParams);
    const startTime = new Date();

    try {
      const res = (await tracedMethod(...args)) as any;

      if (isAsyncIterable(res)) {
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

            const processedChunk = parseChunk(rawChunk);

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

          const endTime = new Date();
          const latency = Number(
            ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(6)
          );
          const usage = parseUsage(res);

          let cost = 0;
          if (usage) {
            const { prompt_tokens, completion_tokens } = usage;
            cost = Number(
              (
                (prompt_tokens ?? 0) * pricing[model].input +
                (completion_tokens ?? 0) * pricing[model].output
              ).toFixed(6)
            );
          }

          weavel.generation({
            ...observationData,
            outputs: [output],
            latency,
            cost: Number(cost),
          });
        }

        return tracedOutputGenerator() as ReturnType<T>;
      }

      const output = parseCompletionOutput(res);
      const endTime = new Date();
      const latency = Number(
        ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(6)
      );

      let cost = 0;
      const usage = parseUsage(res);

      if (usage) {
        const { prompt_tokens, completion_tokens } = usage;
        cost = Number(
          (
            (prompt_tokens ?? 0) * pricing[model].input +
            (completion_tokens ?? 0) * pricing[model].output
          ).toFixed(6)
        );
      }

      weavel.generation({
        ...observationData,
        outputs: [output],
        latency,
        cost: Number(cost),
      });

      return res;
    } catch (error) {
      const endTime = new Date();
      const latency = Number(
        ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(6)
      );

      weavel.generation({
        ...observationData,
        latency,
        cost: 0,
      });

      throw error;
    }
  } catch (error) {
    throw error;
  }
};
