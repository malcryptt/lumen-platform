import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv', 'target', 'vendor', '.next', '.nuxt', 'coverage', '.nyc_output'];
const MAX_DEPTH = 3;
const MAX_FILES = 200;
const MAX_FILE_SIZE = 8 * 1024; // 8KB
const MAX_LINES = 100;

export interface IngestResult {
    fileTree: string[];
    manifests: Record<string, string>;
    notes: string[];
}

export async function cloneRepository(repoUrl: string, tokenEnc?: string): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), `lumen-scan-${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });

    let finalUrl = repoUrl;
    if (tokenEnc) {
        // Embed token if private 
        try {
            const parsed = new URL(repoUrl);
            parsed.username = 'x-access-token';
            parsed.password = tokenEnc; // Note: In reality this would be decrypted token
            finalUrl = parsed.toString();
        } catch { }
    }

    return new Promise((resolve, reject) => {
        const git = spawn("git", ["clone", "--depth", "1", "--single-branch", finalUrl, tmpDir], { stdio: 'pipe' });

        const timeout = setTimeout(() => {
            git.kill('SIGKILL');
            reject(new Error('Git clone timed out after 30 seconds'));
        }, 30000);

        git.on("close", (code) => {
            clearTimeout(timeout);
            if (code === 0) resolve(tmpDir);
            else reject(new Error(`Git clone failed with exit code ${code}`));
        });
    });
}

export async function ingestDirectory(dir: string): Promise<IngestResult> {
    const fileTree: string[] = [];
    const manifests: Record<string, string> = {};
    const notes: string[] = [];
    let fileCount = 0;

    async function walk(currentDir: string, depth: number) {
        if (depth > MAX_DEPTH) return;
        if (fileCount >= MAX_FILES) return;

        let entries;
        try {
            entries = await fs.readdir(currentDir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (fileCount >= MAX_FILES) {
                if (!notes.includes('Large repo detected. Scanner analyzed 200 of <N> files. Review the config carefully.')) {
                    notes.push('Large repo detected. Scanner analyzed 200 of <N> files. Review the config carefully.');
                }
                break;
            }

            if (EXCLUDED_DIRS.includes(entry.name)) continue;

            const fullPath = path.join(currentDir, entry.name);
            const relativePath = path.relative(dir, fullPath);

            if (entry.isDirectory()) {
                fileTree.push(`[DIR] ${relativePath}/`);
                await walk(fullPath, depth + 1);
            } else {
                fileTree.push(relativePath);
                fileCount++;

                // If it's a manifest or source file in root
                if (depth <= 1 || ['package.json', 'Cargo.toml', 'requirements.txt', 'go.mod', 'Dockerfile', '.env.example'].includes(entry.name)) {
                    try {
                        const stats = await fs.stat(fullPath);
                        let content = await fs.readFile(fullPath, 'utf-8');

                        if (stats.size >= MAX_FILE_SIZE) {
                            const lines = content.split('\n');
                            content = lines.slice(0, MAX_LINES).join('\n') + '\n...[TRUNCATED]';
                        }

                        // Prompt injection mitigation wrapper
                        manifests[relativePath] = `<file path='${relativePath}'><content>${content}</content></file>`;
                    } catch (e) {
                        // ignore unreadable
                    }
                }
            }
        }
    }

    await walk(dir, 0);

    return { fileTree, manifests, notes };
}
