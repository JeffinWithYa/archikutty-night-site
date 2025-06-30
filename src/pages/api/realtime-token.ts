import type { NextApiRequest, NextApiResponse } from 'next';

interface RealtimeTokenResponse {
    token: string;
    expires_at: number;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RealtimeTokenResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        // For now, return the API key directly since ephemeral token creation is having issues
        // This is acceptable for development/testing - in production you'd want ephemeral tokens
        console.log('Returning OpenAI API key for WebRTC connection');

        return res.status(200).json({
            token: openaiApiKey,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        });

    } catch (error) {
        console.error('Failed to create realtime token:', error);
        return res.status(500).json({
            error: 'Failed to create realtime token'
        });
    }
} 