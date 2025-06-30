import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

// Configure AWS S3 for storing RSVP data
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
    try {
        const rsvpData = await request.json();
        const { name, email, attending, guests, dietary, location, message } = rsvpData;

        // Validate required fields
        if (!name || !email || !attending) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, and attendance status' },
                { status: 400 }
            );
        }

        // Create timestamp and unique ID
        const timestamp = new Date().toISOString();
        const rsvpId = `rsvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Prepare data for storage
        const rsvpRecord = {
            id: rsvpId,
            timestamp,
            name,
            email,
            attending,
            guests: parseInt(guests) || 1,
            dietary: dietary || '',
            location: location || '',
            message: message || '',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        };

        // Save to S3
        try {
            const s3Params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: `rsvp-submissions/${rsvpId}.json`,
                Body: JSON.stringify(rsvpRecord, null, 2),
                ContentType: 'application/json',
            };
            await s3.putObject(s3Params).promise();
            console.log(`RSVP saved to S3: ${s3Params.Key}`);
        } catch (s3Error) {
            console.error('Failed to save RSVP to S3:', s3Error);
            return NextResponse.json(
                { error: 'Failed to save RSVP. Please try again or contact info@archikutty.com' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'RSVP submitted successfully',
            rsvpId
        });

    } catch (error) {
        console.error('Failed to process RSVP:', error);
        return NextResponse.json(
            {
                error: 'Failed to submit RSVP. Please try again or contact info@archikutty.com',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            },
            { status: 500 }
        );
    }
} 