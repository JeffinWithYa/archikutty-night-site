// realtime-proxy.js
require('dotenv').config();
require('dotenv').config({ path: '.env.local' }); // Also load .env.local
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
const PORT = process.env.REALTIME_PROXY_PORT || 4000;

const app = express();
app.use(cors()); // Allow CORS for frontend connections

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Realtime proxy server is running' });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

console.log(`Starting OpenAI Realtime API proxy server...`);
console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);

wss.on('connection', (clientWs, req) => {
    console.log(`[PROXY] New client connected from ${req.socket.remoteAddress}`);

    // Connect to OpenAI Realtime API
    const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1',
        },
    });

    let isConnected = false;

    openaiWs.on('open', () => {
        console.log('[PROXY] Connected to OpenAI Realtime API');
        isConnected = true;
    });

    openaiWs.on('error', (error) => {
        console.error('[PROXY] OpenAI WebSocket error:', error);
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close(1011, 'OpenAI connection error');
        }
    });

    openaiWs.on('close', (code, reason) => {
        console.log(`[PROXY] OpenAI WebSocket closed: ${code} ${reason}`);
        isConnected = false;
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close(code, reason);
        }
    });

    // Forward messages from client to OpenAI
    clientWs.on('message', (msg) => {
        if (openaiWs.readyState === WebSocket.OPEN && isConnected) {
            openaiWs.send(msg);
            console.log('[PROXY] Forwarded message to OpenAI:', msg.toString().substring(0, 100) + '...');
        } else {
            console.warn('[PROXY] OpenAI WebSocket not ready, dropping message. State:', openaiWs.readyState, 'Connected:', isConnected);
        }
    });

    // Forward messages from OpenAI to client
    openaiWs.on('message', (msg) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(msg);

            // Better logging based on message type
            if (msg instanceof Buffer) {
                if (msg.length > 0 && msg[0] === 123) { // 123 = '{' in ASCII
                    // This looks like JSON
                    try {
                        const jsonStr = msg.toString('utf8');
                        const data = JSON.parse(jsonStr);
                        console.log('[PROXY] Forwarded JSON to client:', data.type, data.event_id ? `(${data.event_id})` : '');
                    } catch (e) {
                        console.log('[PROXY] Forwarded text to client:', msg.toString().substring(0, 100) + '...');
                    }
                } else {
                    // This is likely binary audio data
                    console.log('[PROXY] Forwarded binary data to client, size:', msg.length);
                }
            } else {
                console.log('[PROXY] Forwarded message to client:', msg.toString().substring(0, 100) + '...');
            }
        } else {
            console.warn('[PROXY] Client WebSocket not ready, dropping message');
        }
    });

    // Handle close events
    clientWs.on('close', (code, reason) => {
        console.log(`[PROXY] Client disconnected: ${code} ${reason}`);
        if (openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.close();
        }
    });

    // Handle errors
    clientWs.on('error', (error) => {
        console.error('[PROXY] Client WebSocket error:', error);
        if (openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.close();
        }
    });
});

server.listen(PORT, () => {
    console.log(`[PROXY] Realtime proxy server listening on port ${PORT}`);
    console.log(`[PROXY] WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`[PROXY] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('[PROXY] Shutting down gracefully...');
    server.close(() => {
        console.log('[PROXY] Server closed');
        process.exit(0);
    });
}); 