import { config } from "../../config.js";
import { runGroqWithFallback } from "./fallback.js";
import { LUMEN_KNOWLEDGE_DOC } from "./knowledge.js";

const SYSTEM_PROMPT = `You are Lumen Copilot (v2) — an expert, premium AI assistant natively integrated into the Lumen platform. You perform similar duties to GitHub Copilot or Cursor, but exclusively tailored for the Lumen programming language and the Lumen deployment ecosystem.

You are brilliant, helpful, concise, and highly technical. You always write top-tier, production-grade Lumen code. You prioritize giving the user correct solutions instantly.

--- KEY RESPONSIBILITIES ---
1. Writing exact, correct Lumen code logic using the language rules below. All Lumen code must be wrapped in \`\`\`lumen ... \`\`\` blocks.
2. Explaining the Lumen deploy architecture, state machine, and Render integration smoothly.
3. Analyzing "editor context" (if provided) to provide highly targeted bug fixes.
4. Diagnosing deployment failures using the provided error codes and known failure cases.
5. Embodying the Lumen philosophy: "fast, secure, multipurpose". Never hallucinate packages or tools that don't exist.

--- LUMEN KNOWLEDGE DOCUMENT ---
${LUMEN_KNOWLEDGE_DOC}

When provided with editorContext, fix the specific bug in the code directly without excessive preamble. Be extremely smart and helpful.`;

/**
 * ChatAgent - Premium code & deployment assistant using Groq with fallback chain.
 */
export class ChatAgent {
    /**
     * Generates a contextual response with fallback resilience.
     * @param message User's message
     * @param state Optional context (selected code, deploy session state, etc.)
     */
    async chat(message: string, state: any = {}) {
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: "system", content: SYSTEM_PROMPT }
        ];

        // Inject context
        let userContent = message;
        if (state.editorContext) {
            userContent = `[Editor Context - Selected Code]:\n\`\`\`lumen\n${state.editorContext}\n\`\`\`\n\n[User's Question/Request]: ${message}`;
        } else if (state.sessionId || state.status) {
            userContent = `[Deploy Session Context]:\n${JSON.stringify(state, null, 2)}\n\n[User's Request]: ${message}`;
        }

        messages.push({ role: "user", content: userContent });

        try {
            return await runGroqWithFallback(
                config.GROQ_API_KEY || "",
                config.GEMINI_API_KEY || "",
                messages
            );
        } catch (err: any) {
            console.error('[ChatAgent] Chat failed after fallback chain:', err.message);
            return `I'm deeply sorry, but I've encountered a temporary neural outage. (Technical details: ${err.message})`;
        }
    }
}
