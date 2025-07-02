import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({}); // Uses default provider chain (env, shared config, etc)

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'feedback-submissions';

export async function POST(req: NextRequest) {
    try {
        const { feedback } = await req.json();
        if (!feedback || typeof feedback !== 'string') {
            return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
        }
        const timestamp = new Date().toISOString();
        const key = `feedback-submissions/feedback-${timestamp}.txt`;
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: feedback,
                ContentType: 'text/plain',
            })
        );
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('S3 feedback error:', error);
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
} 