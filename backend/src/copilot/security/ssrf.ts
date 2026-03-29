export function validateGitUrl(url: string): boolean {
    const gitUrlRegex = /^https:\/\/(github\.com|gitlab\.com)\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?\/?$/;
    if (!gitUrlRegex.test(url)) {
        return false;
    }

    try {
        const parsed = new URL(url);
        // Explicitly block internal/localhost IPs if they bypassed regex somehow
        const hostname = parsed.hostname.toLowerCase();
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '169.254.169.254' ||
            hostname === '::1' ||
            hostname.startsWith('10.') ||
            hostname.startsWith('192.168.') ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
        ) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}
