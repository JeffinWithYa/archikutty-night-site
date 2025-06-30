import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, sessionId, callDuration, metadata } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        // Create comprehensive transcript data
        const transcriptData = {
            sessionId,
            timestamp: Date.now(),
            callType: 'voice',
            callDuration: callDuration || 0,
            metadata: {
                ...metadata,
                totalMessages: messages.length,
                aiMessages: messages.filter(m => m.sender === 'ai').length,
                userMessages: messages.filter(m => m.sender === 'user').length
            },
            messages: messages.map(msg => ({
                sender: msg.sender,
                text: msg.text,
                timestamp: Date.now() // Could be more precise if we track individual message times
            }))
        };

        // Save transcript to S3
        const transcript = JSON.stringify(transcriptData, null, 2);
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `family-tree-voice-chats/${sessionId || 'unknown'}-${Date.now()}.json`,
            Body: transcript,
            ContentType: 'application/json',
        };

        await s3.putObject(s3Params).promise();
        console.log(`Voice chat transcript saved to S3: ${s3Params.Key}`);

        return NextResponse.json({
            success: true,
            s3Key: s3Params.Key,
            messageCount: messages.length
        });

    } catch (error) {
        console.error('Failed to save voice transcript:', error);
        return NextResponse.json({
            error: 'Failed to save voice transcript'
        }, { status: 500 });
    }
} 