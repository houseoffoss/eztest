/**
 * Provider-agnostic AI client for Agent Testing.
 *
 * Supports:
 *   - Anthropic (Claude) — uses @anthropic-ai/sdk
 *   - Google AI Studio (Gemini) — uses @google/generative-ai
 *
 * Each call returns a plain string (the model's text response).
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { InternalServerException } from "@/backend/utils/exceptions";

export type AiProvider = "anthropic" | "google";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiCallOptions {
  provider: AiProvider;
  apiKey: string;
  /** System prompt (instruction context before the conversation) */
  system?: string;
  messages: AiMessage[];
  maxTokens?: number;
}

// ── Anthropic defaults ────────────────────────────────────────────────────────
const ANTHROPIC_GENERATION_MODEL = "claude-opus-4-6";
const ANTHROPIC_SCORING_MODEL = "claude-haiku-4-5-20251001";

// ── Google defaults ───────────────────────────────────────────────────────────
const GOOGLE_GENERATION_MODEL = "gemini-3-flash-preview";
const GOOGLE_SCORING_MODEL = "gemini-3-flash-preview";

export function getDefaultModel(
  provider: AiProvider,
  purpose: "generation" | "scoring",
): string {
  if (provider === "anthropic") {
    return purpose === "generation"
      ? ANTHROPIC_GENERATION_MODEL
      : ANTHROPIC_SCORING_MODEL;
  }
  return purpose === "generation"
    ? GOOGLE_GENERATION_MODEL
    : GOOGLE_SCORING_MODEL;
}

/**
 * Call the AI provider and return the text response.
 * Throws InternalServerException on provider errors.
 */
export async function callAi(
  opts: AiCallOptions & { purpose: "generation" | "scoring" },
): Promise<string> {
  const model = getDefaultModel(opts.provider, opts.purpose);

  if (opts.provider === "anthropic") {
    return callAnthropic({ ...opts, model });
  }
  return callGoogle({ ...opts, model });
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

async function callAnthropic(
  opts: AiCallOptions & { model: string },
): Promise<string> {
  const client = new Anthropic({ apiKey: opts.apiKey });

  let response: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    response = await client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 8192,
      ...(opts.system ? { system: opts.system } : {}),
      messages: opts.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
  } catch (err: unknown) {
    if (err instanceof Anthropic.APIError) {
      if (err.status === 400 && err.message.includes("content filtering")) {
        throw new InternalServerException(
          "Request was blocked by Anthropic content filtering. Try rephrasing your agent description.",
        );
      }
      throw new InternalServerException(
        `Anthropic API error (${err.status}): ${err.message}`,
      );
    }
    throw new InternalServerException("Unexpected error calling Anthropic API");
  }

  const block = response.content[0];
  if (block?.type !== "text") {
    throw new InternalServerException(
      "Unexpected response format from Anthropic",
    );
  }
  return block.text;
}

// ── Google AI Studio ──────────────────────────────────────────────────────────

async function callGoogle(
  opts: AiCallOptions & { model: string },
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: opts.apiKey });

  // Build contents array — new SDK uses { role, parts } shape
  const contents = opts.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Prepend system instruction as a leading user turn if provided
  if (opts.system) {
    contents.unshift({ role: "user", parts: [{ text: opts.system }] });
  }

  try {
    const response = await ai.models.generateContent({
      model: opts.model,
      contents,
      config: {
        maxOutputTokens: opts.maxTokens ?? 8192,
      },
    });

    const text = response.text;
    if (!text) {
      throw new InternalServerException("Google AI returned an empty response");
    }
    return text;
  } catch (err: unknown) {
    if (err instanceof InternalServerException) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new InternalServerException(`Google AI API error: ${message}`);
  }
}
