import path from 'node:path'
import { mkdir } from 'node:fs/promises'

const PUBLIC_PREFIX = '/uploads'

/** Root folder for uploaded files. On Hostinger VPS set UPLOAD_DIR outside the deploy folder. */
export function getUploadRoot() {
    const configured = process.env.UPLOAD_DIR?.trim()
    if (configured) return path.resolve(configured)
    if (process.env.NODE_ENV === 'production' && !getUploadRoot._warned) {
        getUploadRoot._warned = true
        console.warn(
            '[LeafyLand] UPLOAD_DIR is not set. Uploaded images are stored under ./uploads and will be lost on redeploy. Set UPLOAD_DIR to a persistent path.',
        )
    }
    return path.join(process.cwd(), 'uploads')
}

/** Legacy location used before external storage (still checked when serving). */
export function getLegacyUploadRoot() {
    return path.join(process.cwd(), 'public', 'uploads')
}

export function toPublicUploadUrl(userId, filename) {
    return `${PUBLIC_PREFIX}/${userId}/${filename}`
}

export function parseUploadRequestPath(segments) {
    if (!Array.isArray(segments) || segments.length < 2) return null
    const safe = segments.every((part) => part && !part.includes('..') && !part.includes('\\'))
    if (!safe) return null
    return segments.join('/')
}

export function resolveUploadFile(relativePath) {
    const root = getUploadRoot()
    const resolved = path.resolve(root, relativePath)
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
        throw new Error('Invalid upload path')
    }
    return resolved
}

export function resolveLegacyUploadFile(relativePath) {
    const root = getLegacyUploadRoot()
    const resolved = path.resolve(root, relativePath)
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
        throw new Error('Invalid upload path')
    }
    return resolved
}

export async function ensureUserUploadDir(userId) {
    if (!userId || userId.includes('..') || userId.includes('/') || userId.includes('\\')) {
        throw new Error('Invalid user id')
    }
    const dir = path.join(/*turbopackIgnore: true*/ getUploadRoot(), userId)
    await mkdir(dir, { recursive: true })
    return dir
}

export const UPLOAD_CACHE_CONTROL = 'public, max-age=31536000, immutable'

export const MIME_BY_EXT = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
}

export function mimeForFilename(filename) {
    const ext = filename.split('.').pop()?.toLowerCase()
    return MIME_BY_EXT[ext] || 'application/octet-stream'
}
