/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/public/v2/batch': {
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
     * @description Capture a batch of tasks and save them in the database for processing.
     *
     *     Args:
     *         body (BatchRequestBody): The request body containing the batch of tasks.
     *
     *     Returns:
     *         Response: The HTTP response with status code 200.
     */
    post: operations['capture_batch_public_v2_batch_post'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
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
      batch: (
        | components['schemas']['CaptureSessionRequest']
        | components['schemas']['IdentifyUserRequest']
        | components['schemas']['CaptureMessageRequest']
        | components['schemas']['CaptureTrackEventRequest']
        | components['schemas']['CaptureTraceRequest']
        | components['schemas']['CaptureSpanRequest']
        | components['schemas']['CaptureLogRequest']
        | components['schemas']['CaptureGenerationRequest']
        | components['schemas']['UpdateTraceRequest']
        | components['schemas']['UpdateSpanRequest']
        | components['schemas']['UpdateGenerationRequest']
        | components['schemas']['CreatePromptRequest']
        | components['schemas']['CreatePromptVersionRequest']
        | components['schemas']['GetPromptVersionRequest']
      )[];
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
       * Created At
       * @description The datetime when the observation was captured. Optional.
       */
      created_at?: string | null;
      /** Name */
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
      /** Record Id */
      record_id?: string | null;
      /**
       * Inputs
       * @description The inputs of the generation. Optional.
       */
      inputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
      /**
       * Outputs
       * @description The outputs of the generation. Optional.
       */
      outputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
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
      type: 'capture-generation';
      body: components['schemas']['CaptureGenerationBody'];
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
       * Created At
       * @description The datetime when the observation was captured. Optional.
       */
      created_at?: string | null;
      /** Name */
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
      /** Record Id */
      record_id?: string | null;
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
      type: 'capture-log';
      body: components['schemas']['CaptureLogBody'];
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
      metadata?: {
        [key: string]: unknown;
      } | null;
      /**
       * Ref Record Id
       * @description The record ID to reference. Optional.
       */
      ref_record_id?: string | null;
      /** Session Id */
      session_id: string;
      /**
       * Role
       * @description The role of the session, 'user', 'assistant', 'system'.
       * @enum {string}
       */
      role: 'user' | 'assistant' | 'system';
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
      type: 'capture-message';
      body: components['schemas']['CaptureMessageBody'];
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
      user_id?: string | null;
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
      type: 'capture-session';
      body: components['schemas']['CaptureSessionBody'];
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
       * Created At
       * @description The datetime when the observation was captured. Optional.
       */
      created_at?: string | null;
      /** Name */
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
      /** Record Id */
      record_id?: string | null;
      /**
       * Inputs
       * @description The inputs of the generation. Optional.
       */
      inputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
      /**
       * Outputs
       * @description The outputs of the generation. Optional.
       */
      outputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
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
      type: 'capture-span';
      body: components['schemas']['CaptureSpanBody'];
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
      metadata?: {
        [key: string]: unknown;
      } | null;
      /**
       * Ref Record Id
       * @description The record ID to reference. Optional.
       */
      ref_record_id?: string | null;
      /** Session Id */
      session_id: string;
      /**
       * Name
       * @description The name of the record. Optional.
       */
      name: string;
      /**
       * Inputs
       * @description The inputs of the trace. Optional.
       */
      inputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
      /**
       * Outputs
       * @description The outputs of the outputs. Optional.
       */
      outputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
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
      type: 'capture-trace';
      body: components['schemas']['CaptureTraceBody'];
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
      metadata?: {
        [key: string]: unknown;
      } | null;
      /**
       * Ref Record Id
       * @description The record ID to reference. Optional.
       */
      ref_record_id?: string | null;
      /** Session Id */
      session_id: string;
      /**
       * Name
       * @description The name of the record. Optional.
       */
      name: string;
      /**
       * Properties
       * @description Additional properties associated with the record. Optional.
       */
      properties?: {
        [key: string]: unknown;
      } | null;
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
      type: 'identify-user';
      body: components['schemas']['IdentifyUserBody'];
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
      properties: {
        [key: string]: unknown;
      };
      /**
       * Created At
       * @description The datetime when the User is identified. Optional.
       */
      created_at?: string | null;
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components['schemas']['ValidationError'][];
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
      type: 'capture-track-event';
      body: components['schemas']['CaptureTrackEventBody'];
    };
    /** UpdateGenerationBody */
    UpdateGenerationBody: {
      /**
       * Created At
       * @description The datetime when the observation was captured. Optional.
       */
      created_at?: string | null;
      /**
       * Name
       * @description The name of the observation. Optional.
       */
      name?: string | null;
      /**
       * Parent Observation Id
       * @description The parent observation ID. Optional.
       */
      parent_observation_id?: string | null;
      /** Observation Id */
      observation_id: string;
      /** Ended At */
      ended_at?: string | null;
      /** Inputs */
      inputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
      /** Outputs */
      outputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
    };
    /** UpdateGenerationRequest */
    UpdateGenerationRequest: {
      /**
       * Type
       * @default update-generation
       * @constant
       * @enum {string}
       */
      type: 'update-generation';
      body: components['schemas']['UpdateGenerationBody'];
    };
    /** UpdateSpanBody */
    UpdateSpanBody: {
      /**
       * Created At
       * @description The datetime when the observation was captured. Optional.
       */
      created_at?: string | null;
      /**
       * Name
       * @description The name of the observation. Optional.
       */
      name?: string | null;
      /**
       * Parent Observation Id
       * @description The parent observation ID. Optional.
       */
      parent_observation_id?: string | null;
      /** Observation Id */
      observation_id: string;
      /** Ended At */
      ended_at?: string | null;
      /** Inputs */
      inputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
      /** Outputs */
      outputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
    };
    /** UpdateSpanRequest */
    UpdateSpanRequest: {
      /**
       * Type
       * @default update-span
       * @constant
       * @enum {string}
       */
      type: 'update-span';
      body: components['schemas']['UpdateSpanBody'];
    };
    /** UpdateTraceBody */
    UpdateTraceBody: {
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
      metadata?: {
        [key: string]: unknown;
      } | null;
      /**
       * Ref Record Id
       * @description The record ID to reference. Optional.
       */
      ref_record_id?: string | null;
      /** Ended At */
      ended_at?: string | null;
      /** Inputs */
      inputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
      /** Outputs */
      outputs?:
        | {
            [key: string]: unknown;
          }
        | string
        | null;
    };
    /** UpdateTraceRequest */
    UpdateTraceRequest: {
      /**
       * Type
       * @default update-trace
       * @constant
       * @enum {string}
       */
      type: 'update-trace';
      body: components['schemas']['UpdateTraceBody'];
    };
    /** CreatePromptBody */
    CreatePromptBody: {
      /**
       * Name
       * @description The name of the prompt. Optional.
       */
      name?: string | null;
      /**
       * Description
       * @description The description of the prompt. Optional.
       */
      description?: string | null;
    };
    /** CreatePromptRequest */
    CreatePromptRequest: {
      /**
       * Type
       * @default create-prompt
       * @constant
       * @enum {string}
       */
      type: 'create-prompt';
      body: components['schemas']['CreatePromptBody'];
    };
    /** CreatePromptVersionBody */
    CreatePromptVersionBody: {
      /** Prompt Name */
      prompt_name: string;
      /** Messages */
      messages: {
        [key: string]: unknown;
      }[];
      /**
       * Model
       * @description The model to use for this prompt version. Optional. Default is 'gpt-4o'.
       */
      model?: string | null;
      /**
       * Temperature
       * @description The temperature setting for the model. Optional. Default is 0.0
       */
      temperature?: number | null;
      /**
       * Response Format
       * @description The response format for the prompt. Optional.
       */
      response_format?: {
        type: 'json_object' | 'json_schema' | 'xml';
        json_schema?: {
          name: string;
          schema: {
            [key: string]: unknown;
          };
          strict?: boolean;
        };
      } | null;
      /**
       * Input Vars
       * @description The input variables for the prompt. Optional.
       */
      input_vars?: {
        [key: string]: unknown;
      } | null;
      /**
       * Output Vars
       * @description The output variables for the prompt. Optional.
       */
      output_vars?: {
        [key: string]: unknown;
      } | null;
      /**
       * Metadata
       * @description Additional metadata for the prompt version. Optional.
       */
      metadata?: {
        [key: string]: unknown;
      } | null;
    };
    /** CreatePromptVersionRequest */
    CreatePromptVersionRequest: {
      /**
       * Type
       * @default create-prompt-version
       * @constant
       * @enum {string}
       */
      type: 'create-prompt-version';
      body: components['schemas']['CreatePromptVersionBody'];
    };
    /** GetPromptVersionRequest */
    GetPromptVersionRequest: {
      /**
       * Type
       * @default fetch-prompt-version
       * @constant
       * @enum {string}
       */
      type: 'get-prompt-version';
      body: components['schemas']['GetPromptVersionBody'];
    };
    /** GetPromptVersionResponse */
    GetPromptVersionResponse: {
      /**
       * Prompt Name
       * @description The name of the prompt.
       */
      prompt_name: string;
      /**
       * Version
       * @description The version number of the prompt.
       */
      version: number;
      /**
       * Messages
       * @description The messages for the prompt version.
       */
      messages: Array<{ [key: string]: any }>;
      /**
       * Model
       * @description The model used for this prompt version.
       */
      model: string;
      /**
       * Temperature
       * @description The temperature setting for this prompt version.
       */
      temperature: number;
      /**
       * Response Format
       * @description The response format for the prompt. Optional.
       */
      response_format?: {
        type: 'json_object' | 'json_schema' | 'xml';
        json_schema?: {
          name: string;
          schema: {
            [key: string]: unknown;
          };
          strict?: boolean;
        };
      } | null;
      /**
       * Input Variables
       * @description The input variables for this prompt version. Optional.
       */
      input_vars?: {
        [key: string]: unknown;
      } | null;
      /**
       * Output Variables
       * @description The output variables for this prompt version. Optional.
       */
      output_vars?: {
        [key: string]: unknown;
      } | null;
      /**
       * Metadata
       * @description Additional metadata for this prompt version. Optional.
       */
      metadata?: {
        [key: string]: unknown;
      } | null;
      /**
       * Created At
       * @description The creation timestamp of this prompt version.
       */
      created_at: string;
    };
    /** GetPromptInfoResponse */
    GetPromptInfoResponse: {
      /**
       * Prompt Name
       * @description The name of the prompt.
       */
      prompt_name: string;
      /**
       * Created At
       * @description The creation timestamp of the prompt.
       */
      created_at: string;
      /**
       * Description
       * @description The description of the prompt.
       */
      description: string;
      /**
       * Versions
       * @description The versions of the prompt.
       */
      versions: {
        version: number;
        created_at: string;
      }[];
    };
    /** GetPromptVersionBody */
    GetPromptVersionBody: {
      /**
       * Prompt Name
       * @description The name of the prompt.
       */
      prompt_name: string;
      /**
       * Version
       * @description The version identifier to fetch. Use 'latest' for the latest version, or specify a version number.
       */
      version: string | number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;
export interface operations {
  capture_batch_public_v2_batch_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BatchRequestBody'];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
}
