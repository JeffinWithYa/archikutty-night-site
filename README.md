This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## OpenAI Realtime API Phone Call Feature

This app includes a real-time phone call feature powered by OpenAI's Realtime API for the Family Tree page.

### Setup

1. **Add your OpenAI API key** to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-here
   REALTIME_PROXY_PORT=4000
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

### Running the Application

To use the phone call feature, you need to run both the Next.js app and the WebSocket proxy server:

```bash
# Run both servers at once (recommended)
npm run dev:full

# Or run them separately in different terminals:
# Terminal 1: Next.js app
npm run dev

# Terminal 2: WebSocket proxy server
npm run proxy
```

### Usage

1. Navigate to the Family Tree page
2. Click "Start AI Agent Phone Call (Audio)" 
3. Grant microphone permissions when prompted
4. Have a real-time conversation with the AI agent about your family tree placement

The AI will ask questions to help place you in the family tree and provide audio responses in real-time.
