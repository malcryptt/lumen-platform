import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config.js";

/**
 * ConfigGenerator - Generates .lumen deploy configuration from scan results.
 */
export class ConfigGenerator {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Generates a .lumen config based on scan results.
     * @param scanResult Output from the RepoScanner
     */
    async generate(scanResult: any) {
        const prompt = `
      You are a specialist in Lumen configuration. Generate a valid .lumen deployment config file
      based on the following repository scan result:

      Scan Results:
      ${JSON.stringify(scanResult, null, 2)}

      Lumen Config Schema Reference:
      deploy {
        name: "string"
        provider: "render"
        region: "string" (default: oregon)

        build {
          runtime: "node" | "python" | "go" | "rust" | "docker"
          version: "string"
          command: "string"
        }

        start {
          command: "string"
          port: number
        }

        env {
          KEY: VALUE (use $secret for sensitive variables)
        }
      }

      Respond ONLY with the generated .lumen config string. Do not include markdown code blocks.
    `;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }
}
