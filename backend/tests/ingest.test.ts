import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { ingestDirectory } from '../src/copilot/scanner/ingest.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('Scanner Ingestion (Section 12 Compliance)', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = path.join(os.tmpdir(), `lumen-test-${Date.now()}`);
        await fs.mkdir(tmpDir, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    test('Ingest: should extract manifest files with injection wrappers', async () => {
        await fs.writeFile(path.join(tmpDir, 'package.json'), '{"name": "test-app"}');
        await fs.writeFile(path.join(tmpDir, 'src.ts'), 'console.log("hello")');

        const { manifests, fileTree } = await ingestDirectory(tmpDir);

        expect(manifests['package.json']).toContain('<file path=\'package.json\'><content>{"name": "test-app"}</content></file>');
        expect(fileTree).toContain('package.json');
        expect(fileTree).toContain('src.ts');
    });

    test('Ingest: should exclude restricted directories', async () => {
        await fs.mkdir(path.join(tmpDir, '.git'), { recursive: true });
        await fs.mkdir(path.join(tmpDir, 'node_modules'), { recursive: true });
        await fs.writeFile(path.join(tmpDir, '.git/config'), 'secret');

        const { fileTree } = await ingestDirectory(tmpDir);

        expect(fileTree).not.toContain('.git/config');
        expect(fileTree).not.toContain('node_modules');
    });

    test('Ingest: should truncate large files (Section 12.1)', async () => {
        const largeContent = 'line\n'.repeat(2000); // 10,000 bytes > 8192
        await fs.writeFile(path.join(tmpDir, 'package.json'), largeContent);

        const { manifests } = await ingestDirectory(tmpDir);

        expect(manifests['package.json']).toContain('...[TRUNCATED]');
        const lines = manifests['package.json'].split('\n');
        // Section 12.1: Truncate to 100 lines + 2 lines for tags
        expect(lines.length).toBeLessThan(110);
    });

});
