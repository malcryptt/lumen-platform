import { config } from "../../config.js";
import { runGroqWithFallback } from "./fallback.js";
import { LUMEN_KNOWLEDGE_DOC } from "./knowledge.js";

const SYSTEM_PROMPT = `You are Lumen Copilot v2 — a premium AI assistant for the Lumen platform.

${LUMEN_KNOWLEDGE_DOC}

As a v2 assistant, you excel at:
1. Writing production-grade Lumen code (always wrap in \`\`\`lumen ... \`\`\` blocks).
2. Explaining the v2 deploy architecture (.lumen config, state machine, Render integration).
3. Analyzing "editor context" (code selected in VS Code) to provide targeted fixes.
4. Using AES-256-GCM encrypted secrets for secure deployments.
5. Diagnosing deployment failures using the new state machine statuses.

Be concise, technically deep, and premium. When provided with editorContext, fix the specific bug in the code.
`;

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
