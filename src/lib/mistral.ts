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
 * - Strip markdown code fences
 * - Replace single quotes with double quotes
 * - Remove trailing commas before } or ]
 */
export function cleanJSON(str: string): string {
  let cleaned = str
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Replace single quotes with double quotes
  cleaned = cleaned.replace(/'/g, '"');

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned;
}
