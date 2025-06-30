# Archikutty Family Reunion Website

A modern, feature-rich family reunion website built with Next.js, featuring AI-powered voice chat for collaborative family tree building. This project combines traditional family reunion planning tools with cutting-edge AI technology to help the Archikutty family connect and organize their genealogy.

## 🌟 Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/archikutty-night-site.git
cd family-reunion
npm install

# Set up environment variables (see deployment section below)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Family Reunion Pages

- **🏠 Home** - Welcome and reunion overview
- **⏰ Countdown** - Days until the reunion
- **🌳 Family Tree** - AI-powered voice chat for genealogy building  
- **📍 Map** - Reunion venue and directions
- **✅ RSVP** - Event registration and meal preferences
- **👥 Committee** - Organizing committee information
- **💰 Budget** - Transparent expense tracking
- **📞 Contact** - Get in touch with organizers
- **💬 Feedback** - Share suggestions and comments

A comprehensive family reunion website featuring AI-powered voice chat for family tree building, built with Next.js and OpenAI's Realtime API.

## 🎯 Features

- **🗣️ AI Voice Chat** - Real-time voice conversations with AI agent for family tree interviews
- **📝 Text Chat** - Alternative text-based family information gathering  
- **🎵 Audio Recording** - Complete conversation recording with mixed caller + AI audio
- **📊 Data Storage** - Automatic transcript and audio storage to AWS S3
- **🔒 Enterprise Security** - Production-ready ephemeral token authentication
- **⏰ Session Management** - 5-minute time limits with countdown timers
- **📱 Mobile Responsive** - Works seamlessly across all devices

## 🚀 Production Deployment

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# AWS S3 Configuration (Required for transcript/audio storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key  
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Other Platforms
- **Netlify**: Add environment variables in site settings
- **AWS Amplify**: Configure in environment variables section
- **Railway**: Set environment variables in project settings
- **Digital Ocean**: Add to app platform environment variables

### S3 Bucket Setup

1. **Create S3 Bucket** with appropriate region
2. **Set Bucket Policy** for your application:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/YOUR_USER"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

3. **Create IAM User** with S3 permissions and generate access keys

### OpenAI API Setup

1. **Get OpenAI API Key** from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Ensure Realtime API Access** (may require tier upgrade)
3. **Monitor Usage** - Realtime API charges per minute of conversation

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key with Realtime API access
- AWS S3 bucket and credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/archikutty-night-site.git
cd family-reunion

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Voice Chat Usage

1. Navigate to the **Family Tree** page
2. Click **"Start Voice Call"** or **"Start Text Chat"**
3. Grant microphone permissions when prompted (voice only)
4. Have a conversation with the AI agent about your family connections
5. Sessions automatically save to S3 for committee review

## 📊 Data Storage Structure

```
S3 Bucket:
├── family-tree-chats/          # Text chat transcripts (JSON)
├── family-tree-voice-chats/    # Voice call transcripts (JSON)  
└── family-tree-voice-audio/    # Voice call recordings (WebM)
```

## 🔒 Security Features

- **✅ Ephemeral Tokens** - No API keys exposed to browser
- **✅ Auto-Expiring Sessions** - Tokens expire automatically
- **✅ Server-Side Configuration** - AI instructions kept secure
- **✅ Encrypted Storage** - All data stored securely in S3

## 💰 Cost Considerations

- **OpenAI Realtime API**: ~$0.06/minute of voice conversation
- **AWS S3**: Minimal storage costs for transcripts and audio
- **Hosting**: Free tier available on most platforms

## 📋 Production Checklist

- [ ] Environment variables configured
- [ ] S3 bucket created and permissions set
- [ ] OpenAI API key has Realtime access
- [ ] Test voice chat functionality
- [ ] Monitor API usage and costs
- [ ] Set up error monitoring (optional)

## 🆘 Troubleshooting

### Common Issues

**Voice chat not connecting:**
- Check OpenAI API key has Realtime API access
- Verify environment variables are set correctly
- Ensure HTTPS in production (required for microphone access)

**S3 uploads failing:**
- Verify AWS credentials and bucket permissions
- Check bucket name and region configuration
- Ensure IAM user has proper S3 permissions

**Audio not recording:**
- Grant microphone permissions in browser
- Use HTTPS (required for microphone access)
- Check browser compatibility (modern browsers only)

For detailed troubleshooting, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

## 🤝 Support

For technical support or questions about the family reunion website, please contact the development team.
