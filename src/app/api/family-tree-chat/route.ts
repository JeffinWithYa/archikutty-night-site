import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import AWS from 'aws-sdk';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const SYSTEM_PROMPT = `You are an AI assistant helping with the Archikutty family reunion. Your role is to gather family information that will be shared with the Archikutty committee to help them build and organize the complete family tree. 

IMPORTANT: Users are instructed to start conversations by providing their full name. When they do this, immediately thank them and ask about their parents' full names. Follow this systematic interview structure:

1) When user provides their name: Thank them and ask for their parents' full names (both mother and father)
2) Ask about siblings and their names  
3) Ask about grandparents (both maternal and paternal sides)
4) Ask about birthplaces and locations
5) Then become more open-ended asking about other relatives, family stories, or connections that might help place them in the Archikutty family tree

Be warm, conversational, ask one question at a time, and explain that this information helps the committee organize the family tree for the reunion. If someone doesn't start with their name, gently guide them to share their full name first.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, sessionId } = body; // messages: [{role, content}], sessionId: string

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
            ],
            temperature: 0.7,
        });
        const aiMessage = completion.choices[0]?.message?.content || '';

        // Save transcript to S3
        const transcript = JSON.stringify({ messages: [...messages, { role: 'assistant', content: aiMessage }], sessionId, timestamp: Date.now() }, null, 2);
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `family-tree-chats/${sessionId || 'unknown'}-${Date.now()}.json`,
            Body: transcript,
            ContentType: 'application/json',
        };
        await s3.putObject(s3Params).promise();

        return NextResponse.json({ aiMessage });
    } catch (err: any) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
    }
} 