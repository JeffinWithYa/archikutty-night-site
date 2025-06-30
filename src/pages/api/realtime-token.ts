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

        // ⚠️  DEVELOPMENT ONLY - SECURITY WARNING ⚠️
        // Currently returning the main OpenAI API key directly to the browser.
        // This exposes your main API key in client-side code and browser dev tools.
        // 
        // For PRODUCTION, you should implement ephemeral tokens:
        // 
        // const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${openaiApiKey}`,
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         model: 'gpt-4o-realtime-preview-2024-12-17',
        //         voice: 'alloy'
        //     })
        // });
        // const sessionData = await response.json();
        // return res.json({
        //     token: sessionData.client_secret.value,
        //     expires_at: sessionData.expires_at
        // });

        console.log('⚠️  DEVELOPMENT MODE: Returning main OpenAI API key to browser');
        console.log('   For production, implement ephemeral tokens instead!');

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