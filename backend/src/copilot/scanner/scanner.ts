import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config.js";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

/**
 * RepoScanner - Analyzes repositories to detect their tech stack and build requirements.
 * Uses Gemini 2.0 Flash for analysis.
 */
export class RepoScanner {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Scans a repository by cloning it and analyzing its contents.
     * @param repoUrl Github repo URL
     */
    async scan(repoUrl: string) {
        const tmpDir = path.join(os.tmpdir(), `lumen-scan-${Date.now()}`);
        await fs.mkdir(tmpDir, { recursive: true });

        try {
            console.log(`[RepoScanner] Cloning ${repoUrl}...`);
            await this.cloneRepo(repoUrl, tmpDir);

            const fileTree = await this.getFileTree(tmpDir);
            const manifestContents = await this.getManifestContents(tmpDir);

            const analysisRaw = await this.analyzeWithGemini(fileTree, manifestContents);
            const result = this.parseAnalysis(analysisRaw);

            return result;
        } finally {
            // Cleanup
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(console.error);
        }
    }

    private async cloneRepo(url: string, dest: string) {
        return new Promise((resolve, reject) => {
            // shallow clone with depth 1 for speed
            const git = spawn("git", ["clone", "--depth", "1", url, dest]);
            git.on("close", (code) => {
                if (code === 0) resolve(true);
                else reject(new Error(`Git clone failed with code ${code}`));
            });
        });
    }

    private async getFileTree(dir: string, depth = 0, maxDepth = 3): Promise<string[]> {
        if (depth > maxDepth) return [];

        const entries = await fs.readdir(dir, { withFileTypes: true });
        let tree: string[] = [];

        for (const entry of entries) {
            if (entry.name === ".git" || entry.name === "node_modules") continue;

            const fullPath = path.join(dir, entry.name);
            const relativePath = entry.name;

            if (entry.isDirectory()) {
                const subTree = await this.getFileTree(fullPath, depth + 1, maxDepth);
                tree.push(`[DIR] ${relativePath}/`);
                tree.push(...subTree.map(s => `  ${s}`));
            } else {
                tree.push(relativePath);
            }
        }
        return tree;
    }

    private async getManifestContents(dir: string) {
        const manifestFiles = ["package.json", "Cargo.toml", "requirements.txt", "go.mod", "Dockerfile", "render.yaml"];
        const contents: Record<string, string> = {};

        for (const file of manifestFiles) {
            const filePath = path.join(dir, file);
            try {
                const content = await fs.readFile(filePath, "utf-8");
                contents[file] = content.slice(0, 5000); // Limit size for Gemini
            } catch (e) {
                // file not present
            }
        }
        return contents;
    }

    private async analyzeWithGemini(fileTree: string[], manifestContents: Record<string, string>) {
        const prompt = `
      You are a backend deployment expert. Analyze the following project structure and manifest files.
      Detect the runtime, build command, start command, and required environment variables.
      
      Project File Tree:
      ${fileTree.join("\n")}

      Manifest Files Contents:
      ${Object.entries(manifestContents).map(([name, content]) => `--- ${name} ---\n${content}`).join("\n\n")}

      Respond ONLY with a valid JSON object following this schema:
      {
        "runtime": "node" | "python" | "go" | "rust" | "docker",
        "version": "version string",
        "buildCommand": "string",
        "startCommand": "string",
        "port": number,
        "envVars": ["KEY1", "KEY2"],
        "confidence": 0-1
      }
    `;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    private parseAnalysis(raw: string) {
        try {
            // Basic JSON extraction if Gemini wraps it in markdown
            const jsonStr = raw.includes("```json")
                ? raw.split("```json")[1].split("```")[0].trim()
                : raw.trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("[RepoScanner] Failed to parse Gemini response:", raw);
            throw new Error("AI analysis resulted in invalid JSON");
        }
    }
}
