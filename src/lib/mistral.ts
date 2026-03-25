import { Mistral } from "@mistralai/mistralai";

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
