import { describe, test, expect } from '@jest/globals';
import { validateGitUrl } from '../src/copilot/security/ssrf.js';
import { sanitizeSecretKey, sanitizeChatContent } from '../src/copilot/security/sanitize.js';

describe('Lumen Security Engine (Section 4 Compliance)', () => {

    test('SSRF: should allow valid GitHub and GitLab URLs', () => {
        expect(validateGitUrl('https://github.com/lumen/platform')).toBe(true);
        expect(validateGitUrl('https://gitlab.com/lumen/platform.git')).toBe(true);
    });

    test('SSRF: should block internal and localhost IPs', () => {
        expect(validateGitUrl('http://127.0.0.1/evil')).toBe(false);
        expect(validateGitUrl('https://169.254.169.254/latest/meta-data')).toBe(false);
        expect(validateGitUrl('https://localhost:3000')).toBe(false);
    });

    test('Sanitize: should block invalid secret keys', () => {
        expect(sanitizeSecretKey('VALID_KEY_123')).toBe('VALID_KEY_123');
        expect(() => sanitizeSecretKey('INVALID-KEY!'))
            .toThrow('Invalid secret key name');
        expect(() => sanitizeSecretKey('DROP TABLE users;--'))
            .toThrow('Invalid secret key name');
    });

    test('Sanitize: should strip HTML from chat', () => {
        const dirty = '<script>alert(1)</script>Hello <b>World</b>';
        const clean = sanitizeChatContent(dirty);
        expect(clean).toBe('Hello World');
    });

});
