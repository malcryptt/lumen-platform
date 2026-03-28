import Groq from "groq-sdk";
import { config } from "../../config.js";

/**
 * ChatAgent - Friendly deployment guide using Groq (Llama 3/4).
 */
export class ChatAgent {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: config.GROQ_API_KEY || "",
        });
    }

    /**
     * Generates a conversational response based on user input and deploy state.
     * @param message User's message
     * @param state Current deployment session state
     */
    async chat(message: string, state: any) {
        const prompt = `
      You are Lumen Copilot, a friendly and expert deployment assistant.
      Your goal is to guide the user through deploying their code using Lumen.

      Current Deploy Session State:
      ${JSON.stringify(state, null, 2)}

      User said: "${message}"

      Contextual Guidance:
      - If status is 'scanning', tell them you're analyzing their repo.
      - If status is 'config_ready', explain the generated Lumen config and ask for confirmation to deploy.
      - If status is 'deploying', explain that the cloud environment is being provisioned.
      - If status is 'live', congratulate them and provide the URL.
      - If status is 'failed', perform a basic diagnostic based on logs (if provided).
      
      Keep your response short, technical yet friendly, and focused on the next step.
    `;

        const chatCompletion = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-70b-versatile", // Using Llama 3.1 as representative of "fast/good"
        });

        return chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting to my brain right now.";
    }
}
