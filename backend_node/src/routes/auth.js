import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTokenFromHeader, verifyAuthToken } from '../utils/middleware.js';
import { hashPassword, verifyPassword, generateUserId, generateToken, userToResponse } from '../utils/auth.js';

const router = Router();

router.post('/signup', async (req, res, next) => {
    try {
        const { username, password, email } = req.body || {};
        if (!username || !password || !email) {
            next({ status: 400, detail: 'Missing required fields' });
            return;
        }

        const { data: u1 } = await supabase.from('users').select('username').eq('username', username);
        if (u1 && u1.length > 0) {
            next({ status: 400, detail: 'Username already exists' });
            return;
        }
        const { data: u2 } = await supabase.from('users').select('email').eq('email', email);
        if (u2 && u2.length > 0) {
            next({ status: 400, detail: 'Email already exists' });
            return;
        }

        const id = generateUserId();
        const hashed = hashPassword(password);
        const now = new Date().toISOString();
        const newUser = { id, username, password: hashed, email, created_at: now };
        const { data: created, error } = await supabase.from('users').insert(newUser).select('*');
        if (error || !created || created.length === 0) {
            next({ status: 400, detail: 'Failed to create user' });
            return;
        }

        const token = generateToken();
        await supabase.from('auth_tokens').insert({ token, username, created_at: now });

        res.status(201).json({ token, user: userToResponse(newUser) });
    } catch (e) {
        next({ status: 400, detail: `Registration failed: ${e.message}` });
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            next({ status: 401, detail: 'Invalid username or password' });
            return;
        }
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();
        if (!user || !verifyPassword(password, user.password)) {
            next({ status: 401, detail: 'Invalid username or password' });
            return;
        }
        const token = generateToken();
        const now = new Date().toISOString();
        await supabase.from('auth_tokens').insert({ token, username: user.username, created_at: now });
        res.json({ token, user: userToResponse(user) });
    } catch (e) {
        next({ status: 401, detail: `Login failed: ${e.message}` });
    }
});

router.post('/logout', getTokenFromHeader, async (req, res, next) => {
    try {
        const token = req.token;
        const { data } = await supabase.from('auth_tokens').delete().eq('token', token).select('*');
        if (data && data.length > 0) {
            res.json({ message: 'Logout successful' });
            return;
        }
        next({ status: 401, detail: 'Token not found' });
    } catch (e) {
        next({ status: 401, detail: `Logout failed: ${e.message}` });
    }
});

router.get('/verify', getTokenFromHeader, verifyAuthToken, async (req, res) => {
    const user = req.user;
    res.json(userToResponse(user));
});

router.get('/me', getTokenFromHeader, verifyAuthToken, async (req, res) => {
    const user = req.user;
    res.json(userToResponse(user));
});

router.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'authentication' });
});

export default router;


