import { WeavelSingleton } from './WeavelSingleton';
import { WeavelConfig, WeavelExtension } from './types';
import { withTracing } from './traceMethod';

export const WeavelOpenAI = <SDKType extends object>(
  sdk: SDKType,
  weavelConfig: WeavelConfig
): SDKType & WeavelExtension => {
  console.log('Initializing WeavelOpenAI with config:', weavelConfig);
  return new Proxy(sdk, {
    get(wrappedSdk, propKey, proxy) {
      console.log(`Accessing property: ${String(propKey)}`);
      const originalProperty = wrappedSdk[propKey as keyof SDKType];

      const defaultGenerationName = `${sdk.constructor?.name}.${propKey.toString()}`;
      const generationName =
        weavelConfig?.generationName ?? defaultGenerationName;
      const config = { ...weavelConfig, generationName };
      console.log('Generated config:', config);

      // Add a flushAsync method to the OpenAI SDK that flushes the Weavel client
      if (propKey === 'flushAsync') {
        console.log('Accessing flushAsync method');
        const weavelClient = WeavelSingleton.getInstance();
        return weavelClient.flushAsync.bind(weavelClient);
      }

      if (typeof originalProperty === 'function') {
        console.log(`Wrapping function: ${String(propKey)} with tracing`);
        return withTracing(originalProperty.bind(wrappedSdk as any), config);
      }

      const isNestedOpenAIObject =
        originalProperty &&
        !Array.isArray(originalProperty) &&
        !(originalProperty instanceof Date) &&
        typeof originalProperty === 'object';

      if (isNestedOpenAIObject) {
        console.log(
          `Detected nested OpenAI object for property: ${String(propKey)}`
        );
        return WeavelOpenAI(originalProperty as SDKType, config);
      }

      console.log(`Returning original property: ${String(propKey)}`);
      return Reflect.get(wrappedSdk, propKey, proxy);
    },
  }) as SDKType & WeavelExtension;
};
