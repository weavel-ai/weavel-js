import { WeavelSingleton } from './WeavelSingleton';
import { WeavelConfig, WeavelExtension } from './types';
import { withTracing } from './traceMethod';

export const WeavelOpenAI = <SDKType extends object>(
  sdk: SDKType,
  weavelConfig: WeavelConfig
): SDKType & WeavelExtension => {
  return new Proxy(sdk, {
    get(wrappedSdk, propKey, proxy) {
      const originalProperty = wrappedSdk[propKey as keyof SDKType];

      const defaultGenerationName = `${sdk.constructor?.name}.${propKey.toString()}`;
      const generationName =
        weavelConfig?.generationName ?? defaultGenerationName;
      const config = { ...weavelConfig, generationName };

      // Add a flushAsync method to the OpenAI SDK that flushes the Weavel client
      if (propKey === 'flushAsync') {
        const weavelClient = WeavelSingleton.getInstance();
        return weavelClient.flushAsync.bind(weavelClient);
      }

      if (typeof originalProperty === 'function') {
        return withTracing(originalProperty.bind(wrappedSdk as any), config);
      }

      const isNestedOpenAIObject =
        originalProperty &&
        !Array.isArray(originalProperty) &&
        !(originalProperty instanceof Date) &&
        typeof originalProperty === 'object';

      if (isNestedOpenAIObject) {
        return WeavelOpenAI(originalProperty as SDKType, config);
      }

      return Reflect.get(wrappedSdk, propKey, proxy);
    },
  }) as SDKType & WeavelExtension;
};
