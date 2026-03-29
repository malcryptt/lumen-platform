import sanitizeHtml from 'sanitize-html';

export function sanitizeSecretKey(key: string): string {
    // Alphanumeric + underscore only. Max 100 chars. Reject anything else.
    if (!/^[a-zA-Z0-9_]{1,100}$/.test(key)) {
        throw new Error('Invalid secret key name. Must be alphanumeric and underscores only, max 100 characters.');
    }
    return key;
}

export function sanitizeChatContent(content: string): string {
    // Strip HTML, max 2000 chars.
    let clean = sanitizeHtml(content, {
        allowedTags: [], // No tags allowed
        allowedAttributes: {}
    });
    return clean.slice(0, 2000);
}
