import * as crypto from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Derive a 256-bit key from the ENCRYPTION_KEY env var.
 * Uses SHA-256 hash to normalize any-length key string into 32 bytes.
 */
function deriveKey(rawKey: string): Buffer {
    return crypto.createHash("sha256").update(rawKey).digest()
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns a string of format: `iv:authTag:ciphertext` (all hex-encoded).
 */
export function encrypt(plaintext: string, encryptionKey: string): string {
    const key = deriveKey(encryptionKey)
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

    let encrypted = cipher.update(plaintext, "utf8", "hex")
    encrypted += cipher.final("hex")
    const authTag = cipher.getAuthTag()

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

/**
 * Decrypt ciphertext encrypted with `encrypt()`.
 * Expects input in format: `iv:authTag:ciphertext` (all hex-encoded).
 */
export function decrypt(ciphertext: string, encryptionKey: string): string {
    const key = deriveKey(encryptionKey)
    const parts = ciphertext.split(":")
    if (parts.length !== 3) {
        throw new Error("Invalid ciphertext format — expected iv:authTag:encrypted")
    }
    const [ivHex, authTagHex, encrypted] = parts as [string, string, string]

    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}
