import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

/**
 * Derives the server-side encryption key from the RENDER_ENCRYPT_KEY env var.
 * The key is padded/hashed to exactly 32 bytes.
 */
function getEncryptionKey(): Buffer {
    const raw = process.env.RENDER_ENCRYPT_KEY || 'lumen-dev-fallback-key-32chars!!';
    // Hash to ensure exactly 32 bytes regardless of input length
    return crypto.createHash('sha256').update(raw).digest();
}

export interface EncryptedValue {
    valueEnc: string; // hex-encoded ciphertext
    iv: string;       // hex-encoded IV
    tag: string;      // hex-encoded auth tag
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns ciphertext + IV + auth tag (all hex-encoded).
 */
export function encrypt(plaintext: string): EncryptedValue {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    return {
        valueEnc: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
    };
}

/**
 * Decrypts an AES-256-GCM encrypted value.
 */
export function decrypt(encrypted: EncryptedValue): string {
    const key = getEncryptionKey();
    const iv = Buffer.from(encrypted.iv, 'hex');
    const tag = Buffer.from(encrypted.tag, 'hex');
    const ciphertext = Buffer.from(encrypted.valueEnc, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}

/**
 * Encrypts a value for storage in the DB.
 * The tag is appended to valueEnc so the DB only needs 2 columns per secret.
 */
export function encryptForStorage(plaintext: string): { valueEnc: string; iv: string } {
    const result = encrypt(plaintext);
    // Pack tag into valueEnc: "ciphertext:tag"
    return {
        valueEnc: `${result.valueEnc}:${result.tag}`,
        iv: result.iv
    };
}

/**
 * Decrypts a value that was stored using encryptForStorage.
 */
export function decryptFromStorage(valueEnc: string, iv: string): string {
    const [ciphertext, tag] = valueEnc.split(':');
    if (!ciphertext || !tag) throw new Error('Invalid encrypted value format');
    return decrypt({ valueEnc: ciphertext, iv, tag });
}
