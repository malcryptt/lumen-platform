import Groq from "groq-sdk";
import { config } from "../../config.js";

const SYSTEM_PROMPT = `You are Lumen Copilot — an expert AI assistant for the Lumen programming language.

Lumen is a fast, secure, multipurpose compiled language with syntax similar to Lua/Rust hybrid.
Key facts about Lumen:
- Comments use --
- Functions: fn name(args) { ... }
- Variables: let x = 5 or val x = 5 (immutable)
- Loops: for i in 1..10 { } and while cond { }
- Strings: "hello {name}" (interpolation with {})
- Types: Int, Float, String, Bool, List, Map, bytes, Result, Option
- Imports: import net, import time, import crypto
- Classes: class Foo { pub fn new() { } }
- Error handling: try { } catch e { }
- It has built-in net, time, crypto, async, and tensor modules

When asked for code, always wrap it in \`\`\`lumen ... \`\`\` blocks.
When the state includes editorContext, analyze that code before answering.
Be concise, technically accurate, and friendly. Help with:
1. Writing and explaining Lumen code
2. Debugging errors
3. Deployment configuration with .lumen files
4. Performance and best practices
`;

/**
 * ChatAgent - Code & deployment assistant using Groq (Llama 4 Scout).
 */
export class ChatAgent {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: config.GROQ_API_KEY || "",
        });
    }

    /**
     * Generates a contextual response.
     * @param message User's message
     * @param state Optional context (selected code, deploy session state, etc.)
     */
    async chat(message: string, state: any = {}) {
        const userContent = state.editorContext
            ? `Context (selected code):\n\`\`\`\n${state.editorContext}\n\`\`\`\n\nUser question: ${message}`
            : state && Object.keys(state).length > 0
                ? `Deploy session state:\n${JSON.stringify(state, null, 2)}\n\nUser said: "${message}"`
                : message;

        const chatCompletion = await this.groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userContent }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.7,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting to my brain right now.";
    }
}
