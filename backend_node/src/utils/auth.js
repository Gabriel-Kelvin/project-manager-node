import crypto from 'crypto';

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password, hashed) {
    try {
        const [salt, hash] = hashed.split(':');
        const candidate = crypto.createHash('sha256').update(password + salt).digest('hex');
        return candidate === hash;
    } catch {
        return false;
    }
}

export function generateUserId() {
    return `user_${crypto.randomBytes(8).toString('hex')}`;
}

export function generateToken() {
    return crypto.randomBytes(32).toString('base64url');
}

export function userToResponse(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
    };
}


