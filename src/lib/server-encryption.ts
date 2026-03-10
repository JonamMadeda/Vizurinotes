import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    // During build time, process.env might not be populated in some CI environments,
    // but for a smooth dev experience, we log an error instead of immediately crashing.
    console.error('WARNING: ENCRYPTION_KEY must be a 64-character hex string (32 bytes) in your .env.local file.');
}

const ALGORITHM = 'aes-256-gcm';

export function encryptTextServer(text: string): string {
    if (!ENCRYPTION_KEY) return text; // Fallback if key missing (only for build processes)

    const iv = crypto.randomBytes(12);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Storing as iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decryptTextServer(encryptedData: string): string {
    if (!encryptedData || !ENCRYPTION_KEY) return encryptedData || "";

    try {
        const parts = encryptedData.split(':');
        // If it doesn't match our exact 3-part encrypted format, assume it is plain text.
        // This allows old, unencrypted notes to still load perfectly fine!
        if (parts.length !== 3) return encryptedData;

        const [ivHex, encryptedText, authTagHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error("Server decryption failed.", error);
        return "[Decryption Failed]";
    }
}
