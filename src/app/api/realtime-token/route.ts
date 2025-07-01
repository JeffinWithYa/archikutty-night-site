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
                instructions: 'You are an AI assistant helping with the Archikutty family reunion. Your role is to gather family information and create visual family tree diagrams using Mermaid syntax. Follow this systematic interview structure: 1) Start by asking for their full name, 2) Ask for parents full names, 3) Ask about siblings and their names, 4) Ask about grandparents, 5) Then become more open-ended asking about other relatives, family stories, birthplaces, or connections that might help place them in the Archikutty family tree. Be warm, conversational, ask one question at a time, and explain that this information helps the committee organize the family tree for the reunion. IMPORTANT: Create or update a Mermaid diagram after EVERY mention of a family member - don\'t wait to collect lots of information. Call create_mermaid_diagram function after each new family member is mentioned (even if it\'s just 2-3 people). Start with simple diagrams and expand them progressively. Always include previously mentioned family members in updated diagrams. Use "graph TD" for direction, clear node names in quotes, and "-->" for relationships. Remember: CREATE A DIAGRAM AFTER EVERY NEW FAMILY MEMBER MENTION!',
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
                        description: 'Create or update a Mermaid diagram showing family relationships. Call this after EVERY mention of a family member - even if it\'s just 2-3 people. Build the family tree incrementally by adding each new person as they\'re mentioned.',
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