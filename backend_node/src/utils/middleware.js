import { supabase } from './supabase.js';

export function getTokenFromHeader(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth) {
        next({ status: 401, detail: 'Authorization header is missing' });
        return;
    }
    const parts = String(auth).split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        next({ status: 401, detail: 'Invalid authorization header format. Expected: Bearer <token>' });
        return;
    }
    req.token = parts[1];
    next();
}

export async function verifyAuthToken(req, res, next) {
    try {
        const token = req.token || (req.headers['authorization'] ? String(req.headers['authorization']).split(' ')[1] : undefined);
        if (!token) {
            next({ status: 401, detail: 'Invalid or expired token' });
            return;
        }
        const { data: tokenRows } = await supabase
            .from('auth_tokens')
            .select('username')
            .eq('token', token)
            .maybeSingle();
        if (!tokenRows || !tokenRows.username) {
            next({ status: 401, detail: 'Invalid or expired token' });
            return;
        }
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('username', tokenRows.username)
            .maybeSingle();
        if (!user) {
            next({ status: 401, detail: 'Invalid or expired token' });
            return;
        }
        req.user = user;
        next();
    } catch (e) {
        next({ status: 401, detail: 'Invalid or expired token' });
    }
}


