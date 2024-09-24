import { Weavel } from "../weavel";
import type { WeavelCoreOptions } from "weavel-core";

/**
 * Represents a singleton instance of the Weavel client.
 */
export class WeavelSingleton {
  private static instance: Weavel | null = null; // Lazy initialization

  /**
   * Returns the singleton instance of the Weavel client.
   * @param options Optional options for initializing the Weavel instance. Only used for the first call.
   * @returns The singleton instance of the Weavel client.
   */
  public static getInstance(options?: WeavelCoreOptions): Weavel {
    if (!WeavelSingleton.instance) {
      WeavelSingleton.instance = new Weavel(options);
    }
    return WeavelSingleton.instance;
  }
}