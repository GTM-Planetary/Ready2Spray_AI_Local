/**
 * Ollama Integration for Local AI Model Testing
 *
 * Ready2Spray Aerial Application Platform
 *
 * This module provides integration with Ollama for running local LLMs,
 * enabling testing of custom agriculture models before production deployment.
 *
 * Supported models:
 * - llama3.2, llama3.1 (general purpose)
 * - codellama (code generation)
 * - mistral, mixtral (efficient inference)
 * - Custom fine-tuned models for aerial application
 */

import { ENV } from "./env";
import type { Message, Tool, ToolChoice, InvokeResult, InvokeParams } from "./llm";

export interface OllamaGenerateRequest {
  model: string;
  prompt?: string;
  messages?: OllamaMessage[];
  stream?: boolean;
  format?: "json" | string;
  options?: OllamaOptions;
  tools?: OllamaTool[];
}

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  images?: string[];
  tool_calls?: OllamaToolCall[];
}

export interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface OllamaTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface OllamaOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_predict?: number;
  stop?: string[];
  seed?: number;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * List available models from Ollama
 */
export async function listOllamaModels(): Promise<{ name: string; size: number; modified_at: string }[]> {
  const response = await fetch(`${ENV.ollamaUrl}/api/tags`);

  if (!response.ok) {
    throw new Error(`Failed to list Ollama models: ${response.status}`);
  }

  const data = await response.json();
  return data.models || [];
}

/**
 * Check if Ollama is running and accessible
 */
export async function checkOllamaHealth(): Promise<{ healthy: boolean; version?: string; error?: string }> {
  try {
    const response = await fetch(`${ENV.ollamaUrl}/api/version`);
    if (response.ok) {
      const data = await response.json();
      return { healthy: true, version: data.version };
    }
    return { healthy: false, error: `Status ${response.status}` };
  } catch (error) {
    return { healthy: false, error: String(error) };
  }
}

/**
 * Pull a model from Ollama registry
 */
export async function pullOllamaModel(modelName: string): Promise<void> {
  const response = await fetch(`${ENV.ollamaUrl}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: modelName, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Failed to pull model ${modelName}: ${response.status}`);
  }
}

/**
 * Convert standard LLM messages to Ollama format
 */
function convertToOllamaMessages(messages: Message[]): OllamaMessage[] {
  return messages.map(msg => {
    let content: string;

    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      content = msg.content
        .map(part => {
          if (typeof part === "string") return part;
          if (part.type === "text") return part.text;
          return JSON.stringify(part);
        })
        .join("\n");
    } else {
      content = JSON.stringify(msg.content);
    }

    return {
      role: msg.role === "function" ? "tool" : msg.role,
      content,
    };
  });
}

/**
 * Convert standard tools to Ollama format
 */
function convertToOllamaTools(tools: Tool[]): OllamaTool[] {
  return tools.map(tool => ({
    type: "function",
    function: {
      name: tool.function.name,
      description: tool.function.description || "",
      parameters: {
        type: "object",
        properties: (tool.function.parameters as any)?.properties || {},
        required: (tool.function.parameters as any)?.required || [],
      },
    },
  }));
}

/**
 * Invoke Ollama for chat completion
 * Compatible with the standard InvokeParams interface
 */
export async function invokeOllama(params: InvokeParams): Promise<InvokeResult> {
  const { messages, tools, toolChoice, responseFormat } = params;

  const ollamaMessages = convertToOllamaMessages(messages);

  const payload: OllamaGenerateRequest = {
    model: ENV.ollamaModel,
    messages: ollamaMessages,
    stream: false,
  };

  // Add tools if provided
  if (tools && tools.length > 0) {
    payload.tools = convertToOllamaTools(tools);
  }

  // Request JSON format if specified
  if (responseFormat?.type === "json_object" || responseFormat?.type === "json_schema") {
    payload.format = "json";
  }

  const response = await fetch(`${ENV.ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} - ${errorText}`);
  }

  const ollamaResponse: OllamaResponse = await response.json();

  // Convert Ollama response to standard InvokeResult format
  const result: InvokeResult = {
    id: `ollama-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model: ollamaResponse.model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: ollamaResponse.message.content,
        tool_calls: ollamaResponse.message.tool_calls?.map((tc, idx) => ({
          id: `call_${idx}`,
          type: "function" as const,
          function: {
            name: tc.function.name,
            arguments: JSON.stringify(tc.function.arguments),
          },
        })),
      },
      finish_reason: ollamaResponse.done ? "stop" : null,
    }],
    usage: {
      prompt_tokens: ollamaResponse.prompt_eval_count || 0,
      completion_tokens: ollamaResponse.eval_count || 0,
      total_tokens: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0),
    },
  };

  return result;
}

/**
 * Generate embeddings using Ollama
 * Useful for semantic search and similarity matching
 */
export async function generateOllamaEmbeddings(
  text: string,
  model: string = "nomic-embed-text"
): Promise<number[]> {
  const response = await fetch(`${ENV.ollamaUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embeddings: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding;
}

/**
 * Aerial Application specific prompt templates
 */
export const AERIAL_APPLICATION_PROMPTS = {
  sprayConditionAnalysis: `You are an expert aerial application advisor for agricultural operations.
Analyze the following weather and field conditions to determine spray suitability.
Consider: wind speed, temperature, humidity, inversion potential, and buffer zones.
Provide a safety score (0-100) and specific recommendations.`,

  driftRiskAssessment: `You are a drift risk assessment specialist for aerial application.
Evaluate the potential for spray drift based on:
- Weather conditions (wind, temperature inversions)
- Application parameters (droplet size, boom height)
- Field geometry and sensitive areas
Provide risk level (Low/Moderate/High/Critical) with mitigation strategies.`,

  complianceCheck: `You are an EPA compliance specialist for aerial pesticide application.
Review the following application details against label requirements:
- Buffer zones and setbacks
- Wind speed restrictions
- Temperature limitations
- Re-entry intervals
Flag any compliance concerns.`,

  flightPlanOptimization: `You are an aerial application flight planning expert.
Optimize the flight plan considering:
- Field boundaries and obstacles
- Wind direction for minimal drift
- Fuel efficiency and coverage patterns
- Turn-around areas and no-spray zones
Provide waypoints and recommended parameters.`,
};
