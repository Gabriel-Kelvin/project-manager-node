import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import rolesRouter from './routes/roles.js';
import analyticsRouter from './routes/analytics.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();

const origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3005',
    'http://127.0.0.1:3005',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://3.85.144.221:3005'
];

app.use(cors({
    origin: origins,
    credentials: true
}));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/projects', projectsRouter);
app.use('/projects/:project_id/tasks', tasksRouter);
app.use('/projects/:project_id/members', rolesRouter);
app.use('/projects/:project_id/analytics', analyticsRouter);
app.use('/', dashboardRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Project Management API',
        version: '1.0.0',
        docs: '/docs',
        redoc: '/redoc'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        api: 'project_management',
        version: '1.0.0'
    });
});

// Error handler to mirror FastAPI HTTPException detail shape
// When throwing errors, use: next({ status: 4xx/5xx, detail: 'message' })
app.use((err, req, res, next) => {
    if (err && (err.status || err.detail)) {
        res.status(err.status || 500).json({ detail: err.detail || 'Internal server error' });
        return;
    }
    res.status(500).json({ detail: 'Internal server error' });
});

const PORT = parseInt(process.env.APP_PORT || '8010', 10);
const HOST = process.env.APP_HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('================================================================================');
    console.log('🚀 PROJECT MANAGEMENT API - READY');
    console.log('================================================================================');
    console.log(`🌐 Server running on http://${HOST}:${PORT}`);
    console.log('================================================================================');
    console.log('📊 Total Endpoints: 29');
    console.log('  - Authentication: 5');
    console.log('  - Projects: 6');
    console.log('  - Tasks: 6');
    console.log('  - Team Members: 6');
    console.log('  - Analytics: 3');
    console.log('  - Dashboard: 3');
    console.log('================================================================================');
});


