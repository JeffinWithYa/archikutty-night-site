import type { NextApiRequest, NextApiResponse } from 'next';
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

const SYSTEM_PROMPT = `You are a helpful family tree assistant. Your job is to ask questions and gather as much information as possible to place the user in their family tree. Ask about names, parents, grandparents, siblings, birthplaces, and any known relatives or branches.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, sessionId } = req.body; // messages: [{role, content}], sessionId: string
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages' });
    }

    try {
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

        res.status(200).json({ aiMessage });
    } catch (err: any) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
} 