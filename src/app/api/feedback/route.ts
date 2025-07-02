import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

// Configure AWS S3 for storing feedback data
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
    try {
        const feedbackData = await request.json();
        const { name, email, category, subject, message, anonymous } = feedbackData;

        // Validate required fields
        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // For anonymous feedback, don't require name/email
        if (!anonymous && (!name || !email)) {
            return NextResponse.json(
                { error: 'Name and email are required for non-anonymous feedback' },
                { status: 400 }
            );
        }

        // Create timestamp and unique ID
        const timestamp = new Date().toISOString();
        const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Prepare data for storage
        const feedbackRecord = {
            id: feedbackId,
            timestamp,
            name: anonymous ? 'Anonymous' : name,
            email: anonymous ? 'anonymous@archikutty.com' : email,
            category: category || 'general',
            subject: subject || 'No subject',
            message,
            anonymous: !!anonymous,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        };

        // Save to S3
        try {
            const s3Params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: `feedback-submissions/${feedbackId}.json`,
                Body: JSON.stringify(feedbackRecord, null, 2),
                ContentType: 'application/json',
            };
            await s3.putObject(s3Params).promise();
            console.log(`Feedback saved to S3: ${s3Params.Key}`);
        } catch (s3Error) {
            console.error('Failed to save feedback to S3:', s3Error);
            return NextResponse.json(
                { error: 'Failed to save feedback. Please try again or contact info@archikutty.com' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
            feedbackId
        });

    } catch (error) {
        console.error('Failed to process feedback:', error);
        return NextResponse.json(
            {
                error: 'Failed to submit feedback. Please try again or contact info@archikutty.com',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            },
            { status: 500 }
        );
    }
} 