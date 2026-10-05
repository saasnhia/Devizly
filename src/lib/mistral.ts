import { Mistral } from "@mistralai/mistralai";
import type { ChatCompletionRequest } from "@mistralai/mistralai/models/components";
import { MistralError } from "@mistralai/mistralai/models/errors";
import type { RequestOptions } from "@mistralai/mistralai/lib/sdks";

let _client: Mistral | null = null;

export function getMistral(): Mistral {
  if (!_client) {
    const key = process.env.MISTRAL_API_KEY;
    if (!key) {
      throw new Error("MISTRAL_API_KEY is not set");
    }
    _client = new Mistral({ apiKey: key });
  }
  return _client;
}

const DEFAULT_MODEL = "mistral-small-latest";
const DEFAULT_FALLBACK_MODEL = "ministral-14b-latest";

/**
 * Statuses on which the fallback model is tried: 429/403 mean the account
 * has lost access or quota on the primary model (seen in prod: limit 0 on
 * mistral-small), 5xx and network errors are transient on Mistral's side.
 * 400/401/422 are not retried — the request or the key is wrong for every model.
 */
function shouldFallback(status: number | null): boolean {
  return status === null || status === 403 || status === 429 || status >= 500;
}

export class AIGenerationError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly mistralCode: string | null
  ) {
    super(message);
    this.name = "AIGenerationError";
  }
}

interface AttemptFailure {
  status: number | null;
  mistralCode: string | null;
  message: string;
}

function describeError(err: unknown): AttemptFailure {
  if (err instanceof MistralError) {
    let mistralCode: string | null = null;
    try {
      const body: unknown = JSON.parse(err.body);
      if (body && typeof body === "object" && "code" in body && body.code != null) {
        mistralCode = String(body.code);
      }
    } catch {
      // body is not JSON — keep code null
    }
    return { status: err.statusCode, mistralCode, message: err.name };
  }
  if (err instanceof AIGenerationError) {
    return { status: err.status, mistralCode: err.mistralCode, message: err.message };
  }
  return { status: null, mistralCode: null, message: err instanceof Error ? err.name : "UnknownError" };
}

/**
 * Chat completion with automatic model fallback.
 * Primary model: MISTRAL_MODEL (default mistral-small-latest).
 * Fallback model: MISTRAL_FALLBACK_MODEL (default ministral-14b-latest), tried
 * once when the primary fails with 429, 403, 5xx or a network error.
 *
 * Logs never contain the prompt nor the completion (personal data).
 * Returns the text content; throws AIGenerationError when every model failed.
 */
export async function completeWithFallback(
  tag: string,
  request: Omit<ChatCompletionRequest, "model">,
  options?: RequestOptions
): Promise<{ content: string; model: string }> {
  const primary = process.env.MISTRAL_MODEL || DEFAULT_MODEL;
  const fallback = process.env.MISTRAL_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL;
  const models = fallback && fallback !== primary ? [primary, fallback] : [primary];

  let lastFailure: AttemptFailure | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const startedAt = Date.now();
    try {
      const completion = await getMistral().chat.complete({ ...request, model }, options);
      const content = completion.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new AIGenerationError("Empty completion", null, null);
      }
      if (i > 0) {
        console.warn(
          JSON.stringify({ event: "mistral_fallback_used", tag, model: primary, fallbackModel: model, durationMs: Date.now() - startedAt })
        );
      }
      return { content, model };
    } catch (err) {
      lastFailure = describeError(err);
      const isLast = i === models.length - 1;
      const willFallback = !isLast && shouldFallback(lastFailure.status);
      console.error(
        JSON.stringify({
          event: "mistral_call_failed",
          tag,
          model,
          fallbackModel: willFallback ? models[i + 1] : null,
          status: lastFailure.status,
          mistralCode: lastFailure.mistralCode,
          error: lastFailure.message,
          durationMs: Date.now() - startedAt,
        })
      );
      if (!willFallback) break;
    }
  }

  throw new AIGenerationError(
    lastFailure?.message ?? "AI generation failed",
    lastFailure?.status ?? null,
    lastFailure?.mistralCode ?? null
  );
}

/**
 * Clean malformed JSON returned by LLMs:
 * - Strip markdown code fences (even mid-string)
 * - Strip text before first { and after last }
 * - Remove trailing commas before } or ]
 */
export function cleanJSON(str: string): string {
  let cleaned = str
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned;
}

/**
 * Tolerant JSON parser for LLM responses.
 * Cleans the string, extracts the first JSON object/array found, and parses it.
 */
export function parseAIResponse<T = unknown>(raw: string): T {
  const cleaned = cleanJSON(raw);

  // Extract the first JSON object or array found in the string
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[1]);

  // If Mistral returns an array, take the first element
  return Array.isArray(parsed) ? parsed[0] : parsed;
}
