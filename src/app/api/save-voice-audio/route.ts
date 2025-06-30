import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const sessionId = formData.get('sessionId') as string;
        const callDuration = formData.get('callDuration') as string;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create S3 key
        const timestamp = Date.now();
        const s3Key = `family-tree-voice-audio/${sessionId || 'unknown'}-${timestamp}.webm`;

        // Save audio to S3
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: s3Key,
            Body: buffer,
            ContentType: 'audio/webm',
            Metadata: {
                sessionId: sessionId || 'unknown',
                callDuration: callDuration || '0',
                timestamp: timestamp.toString(),
                originalFileName: audioFile.name || 'voice-call.webm'
            }
        };

        await s3.putObject(s3Params).promise();
        console.log(`Voice audio saved to S3: ${s3Key}`);

        return NextResponse.json({
            success: true,
            s3Key,
            fileSize: buffer.length,
            callDuration: parseInt(callDuration || '0')
        });

    } catch (error) {
        console.error('Failed to save voice audio:', error);
        return NextResponse.json({
            error: 'Failed to save voice audio'
        }, { status: 500 });
    }
} 