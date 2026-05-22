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

// ── Anthropic model catalogue ─────────────────────────────────────────────────
export const ANTHROPIC_MODELS: { value: string; label: string }[] = [
  { value: "claude-opus-4-6", label: "Claude Opus 4.6" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { value: "claude-opus-4-5", label: "Claude Opus 4.5" },
  { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
];

// ── Google model catalogue ────────────────────────────────────────────────────
export const GOOGLE_MODELS: { value: string; label: string }[] = [
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
];

/** Return known models for a given provider */
export function getModelsForProvider(
  provider: AiProvider,
): { value: string; label: string }[] {
  return provider === "anthropic" ? ANTHROPIC_MODELS : GOOGLE_MODELS;
}

// ── Fallback defaults (used when no model is stored on the config) ────────────
const ANTHROPIC_DEFAULT_GENERATION_MODEL = "claude-opus-4-6";
const ANTHROPIC_DEFAULT_SCORING_MODEL = "claude-haiku-4-5-20251001";
const GOOGLE_DEFAULT_GENERATION_MODEL = "gemini-2.5-pro";
const GOOGLE_DEFAULT_SCORING_MODEL = "gemini-2.5-pro";

export function getDefaultModel(
  provider: AiProvider,
  purpose: "generation" | "scoring",
): string {
  if (provider === "anthropic") {
    return purpose === "generation"
      ? ANTHROPIC_DEFAULT_GENERATION_MODEL
      : ANTHROPIC_DEFAULT_SCORING_MODEL;
  }
  return purpose === "generation"
    ? GOOGLE_DEFAULT_GENERATION_MODEL
    : GOOGLE_DEFAULT_SCORING_MODEL;
}

/**
 * Env-level defaults — last-resort fallback when a config has no stored
 * provider / model / API key.
 *
 * Reads:
 *   AI_PROVIDER       "anthropic" | "google"   (default: "anthropic")
 *   AI_MODEL          any model string          (default: provider built-in)
 *   ANTHROPIC_API_KEY used when provider is anthropic
 *   GOOGLE_API_KEY    used when provider is google
 */
export function getEnvDefaults(): {
  provider: AiProvider;
  model: string | undefined;
  apiKey: string | undefined;
} {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  const provider: AiProvider = raw === "google" ? "google" : "anthropic";
  const model = process.env.AI_MODEL?.trim() || undefined;
  const apiKey =
    provider === "google"
      ? process.env.GOOGLE_API_KEY?.trim() || undefined
      : process.env.ANTHROPIC_API_KEY?.trim() || undefined;
  return { provider, model, apiKey };
}

/**
 * Call the AI provider and return the text response.
 * Pass `model` to override the default for the provider/purpose pair.
 * Throws InternalServerException on provider errors.
 */
export async function callAi(
  opts: AiCallOptions & {
    purpose: "generation" | "scoring";
    /** Explicit model override (stored in AgentTestConfig.aiModel) */
    model?: string;
  },
): Promise<string> {
  const model = opts.model ?? getDefaultModel(opts.provider, opts.purpose);

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
