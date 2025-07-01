import { NextRequest, NextResponse } from 'next/server';

interface RealtimeTokenResponse {
    token: string;
    expires_at: number;
}

interface ErrorResponse {
    error: string;
}

export async function POST(request: NextRequest) {
    try {
        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // 🔒 PRODUCTION SECURITY: Using ephemeral tokens
        // Create a temporary session token that expires automatically
        console.log('🔒 Creating ephemeral token for secure production use');

        const sessionResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2024-12-17',
                voice: 'alloy',
                instructions: 'You are an AI assistant helping with the Archikutty family reunion. Your role is to gather family information and create visual family tree diagrams using Mermaid syntax. CONVERSATION FLOW: Most users will start by stating their name. When they give you their name, DO NOT create a diagram yet, just ask: "Great to meet you [Name]! What are your parents\' full names?" After they give parents, NOW create the first diagram showing: Parents at top → User below them, then ask: "I\'ve created your family tree with you and your parents! Do you have any siblings? If so, what are their names?" After siblings, create updated diagram adding siblings at same level as the user. DIAGRAM RULES: DO NOT create a diagram when user only gives their name. Create the FIRST diagram only after getting parental information. Always show correct family hierarchy: older generations above, younger below. For parent-child relationships: Parent nodes at top, children below with arrows Parent --> Child. CORRECT EXAMPLES: A["Robert Smith"] --> C["John Smith"] and B["Mary Smith"] --> C["John Smith"]. REMEMBER: NO diagram on name only, First diagram ONLY after getting parents, Parents ABOVE children in hierarchy.',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                    model: 'whisper-1'
                },
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 200
                },
                tools: [
                    {
                        type: 'function',
                        name: 'create_mermaid_diagram',
                        description: 'Create or update a Mermaid diagram showing family relationships. DO NOT call when user only gives their name. Call FIRST TIME only after getting parental information. Show correct hierarchy: parents above children. Use Parent --> Child arrows.',
                        parameters: {
                            type: 'object',
                            properties: {
                                mermaid_code: {
                                    type: 'string',
                                    description: 'The Mermaid diagram code using proper syntax. Use "graph TD" for direction, clear node names in quotes, and "-->" for relationships.'
                                },
                                description: {
                                    type: 'string',
                                    description: 'A brief description of what this diagram shows (e.g., "Family tree showing John, his parents, and siblings")'
                                }
                            },
                            required: ['mermaid_code', 'description']
                        }
                    }
                ]
            })
        });

        if (!sessionResponse.ok) {
            const errorText = await sessionResponse.text();
            console.error('OpenAI session creation failed:', sessionResponse.status, errorText);
            throw new Error(`Failed to create OpenAI session: ${sessionResponse.status} ${errorText}`);
        }

        const sessionData = await sessionResponse.json();
        console.log('✅ Ephemeral token created successfully, expires at:', new Date(sessionData.expires_at * 1000).toISOString());

        return NextResponse.json({
            token: sessionData.client_secret.value,
            expires_at: sessionData.expires_at
        });

    } catch (error) {
        console.error('Failed to create realtime token:', error);
        return NextResponse.json({
            error: 'Failed to create realtime token'
        }, { status: 500 });
    }
} 