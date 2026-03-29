import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const GEMINI_PRIMARY = 'gemini-2.0-flash';
const GEMINI_FALLBACK = 'gemini-1.5-flash';
const GROQ_PRIMARY = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_FALLBACK = 'mixtral-8x7b-32768';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number,
    backoffs: number[]
): Promise<T> {
    let lastErr: Error | undefined;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastErr = err;
            if (i < retries) {
                await sleep(backoffs[i] || 1000);
            }
        }
    }
    throw lastErr;
}

/**
 * Run a Gemini prompt with automatic fallback from 2.0 Flash → 1.5 Flash.
 * Applies 3 retries with exponential backoff: 1s, 3s, 9s
 */
export async function runGeminiWithFallback(
    apiKey: string,
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    const client = new GoogleGenerativeAI(apiKey);

    async function tryModel(modelId: string): Promise<string> {
        return retryWithBackoff(async () => {
            const model = client.getGenerativeModel({
                model: modelId,
                systemInstruction
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (!text) throw new Error('Empty response from Gemini');
            return text;
        }, 3, [1000, 3000, 9000]);
    }

    try {
        return await tryModel(GEMINI_PRIMARY);
    } catch (primaryErr) {
        console.warn(`[Fallback] Gemini ${GEMINI_PRIMARY} failed, trying ${GEMINI_FALLBACK}:`, (primaryErr as Error).message);
        try {
            return await tryModel(GEMINI_FALLBACK);
        } catch (fallbackErr) {
            throw new Error(`Both Gemini models failed. Last error: ${(fallbackErr as Error).message}`);
        }
    }
}

/**
 * Run a Groq chat with fallback from Llama 4 → Mixtral → Gemini Flash (emergency).
 * Applies 2 retries with 500ms backoff.
 */
export async function runGroqWithFallback(
    groqApiKey: string,
    geminiApiKey: string,
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): Promise<string> {
    const groq = new Groq({ apiKey: groqApiKey });

    async function tryGroqModel(model: string): Promise<string> {
        return retryWithBackoff(async () => {
            const completion = await groq.chat.completions.create({
                messages, model,
                temperature: 0.7,
                max_tokens: 1024
            });
            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('Empty Groq response');
            return content;
        }, 2, [500, 500]);
    }

    try {
        return await tryGroqModel(GROQ_PRIMARY);
    } catch {
        console.warn('[Fallback] Groq primary failed, trying Mixtral...');
        try {
            return await tryGroqModel(GROQ_FALLBACK);
        } catch {
            console.warn('[Fallback] Both Groq models failed, using Gemini Flash as emergency...');
            // Emergency fallback: use Gemini for chat
            const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
            const systemMsg = messages.find(m => m.role === 'system')?.content;
            return runGeminiWithFallback(geminiApiKey, userMessage, systemMsg);
        }
    }
}
