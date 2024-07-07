import { type WeavelCoreOptions } from "weavel-core";

export type WeavelOptions = {
  // autocapture?: boolean
  persistence?: "localStorage" | "sessionStorage" | "cookie" | "memory";
  persistence_name?: string;
  enabled?: boolean;
} & WeavelCoreOptions;
