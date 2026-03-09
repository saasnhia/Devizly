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
