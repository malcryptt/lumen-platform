import { config } from "../../config.js";
import { runGeminiWithFallback } from "../agent/fallback.js";

const SCHEMA_PROMPT = `You are a specialist in Lumen configuration (.lumen files).
Generate a valid, production-ready .lumen deployment config file for the repository described in the scan result.

RULES:
1. OUTPUT ONLY the .lumen config string.
2. NO MARKDOWN CODE BLOCKS.
3. Use $secret for sensitive environment variables (e.g. DATABASE_URL: $secret).
4. Default provider is "render". Default region is "oregon".

LUMEN V2 SCHEMA REFERENCE:
deploy {
    name: "app-name"
    provider: "render"
    region: "oregon" | "frankfurt" | "singapore"
    plan: "free" | "starter" | "standard" | "pro"

    build {
        runtime: "node" | "python" | "go" | "rust" | "docker" | "static"
        version: "string" (e.g. "20.x", "3.11")
        command: "string" (build/install command)
    }

    start {
        command: "string" (start command)
        port: number (default 3000)
        healthCheck: "string" (path, e.g. "/health")
    }

    scaling {
        instances: number (default 1)
        autoScaling: bool (default false)
    }

    env {
        NODE_ENV: "production"
        LOG_LEVEL: "info"
        -- Add detected keys from scan results here.
    }
}
`;

/**
 * ConfigGenerator - Generates premium .lumen deploy configuration with fallback resilience.
 */
export class ConfigGenerator {
  /**
   * Generates a .lumen config based on scan results.
   * @param scanResult Output from the RepoScanner
   */
  async generate(scanResult: any): Promise<string> {
    const prompt = `
            Scan Result Data:
            ${JSON.stringify(scanResult, null, 2)}

            Generate the .lumen config now:
        `;

    try {
      const configText = await runGeminiWithFallback(
        config.GEMINI_API_KEY || "",
        prompt,
        SCHEMA_PROMPT
      );
      return configText.trim();
    } catch (err: any) {
      console.error('[ConfigGenerator] Generation failed after fallback chain:', err.message);
      throw new Error(`Failed to generate config: ${err.message}`);
    }
  }
}
