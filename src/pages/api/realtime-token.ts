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

        // Create ephemeral token via OpenAI Realtime API
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2024-12-17',
                voice: 'alloy',
                modalities: ['audio'],
                instructions: 'You are a helpful family tree assistant for the Archikutty family reunion. Ask questions to help place the user in the family tree. Keep responses conversational and brief.',
                turn_detection: {
                    type: 'server_vad'
                },
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                // Token expires in 60 seconds
                expires_at: Math.floor(Date.now() / 1000) + 60
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            return res.status(response.status).json({
                error: `OpenAI API error: ${response.status} ${errorText}`
            });
        }

        const sessionData = await response.json();

        // Return the ephemeral token and expiration
        return res.status(200).json({
            token: sessionData.client_secret.value,
            expires_at: sessionData.expires_at
        });

    } catch (error) {
        console.error('Failed to create realtime session:', error);
        return res.status(500).json({
            error: 'Failed to create realtime session'
        });
    }
} 