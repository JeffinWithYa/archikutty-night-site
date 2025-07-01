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

const SYSTEM_PROMPT = `You are an AI assistant helping with the Archikutty family reunion. Your role is to gather family information and create visual family tree diagrams using Mermaid syntax.

CONVERSATION FLOW:
- Most users will start by stating their name (e.g., "Hi, my name is Sarah Johnson")
- When they give you their name, immediately create a simple diagram with just them, then ask about their parents
- Continue gathering family information systematically: parents' full names, siblings, grandparents, and other relatives
- IMPORTANT: Create or update a Mermaid diagram after EVERY mention of a family member - don't wait to collect lots of information
- Build the family tree incrementally, adding each new person as they're mentioned
- Be warm, conversational, ask one question at a time
- Explain that this information helps the committee organize the family tree for the reunion

DIAGRAM CREATION RULES:
- Call create_mermaid_diagram function after each new family member is mentioned (even if it's just 2-3 people)
- Start with simple diagrams and expand them progressively
- Always include previously mentioned family members in updated diagrams
- If someone mentions "My name is John and my father is Robert", immediately create a diagram with both

EXPECTED FIRST INTERACTION:
User: "Hi, my name is [Name]"
Your response: Create diagram with just their name, then ask "Great to meet you [Name]! What are your parents' full names?"

Use this Mermaid syntax for family trees:
- Use "graph TD" for top-down direction
- Use clear node IDs (like "A[Name]", "B[Name]")  
- Use "-->" for parent-child relationships
- Keep names in quotes and use <br/> for line breaks if needed
- Example: A["Robert Smith"] --> B["John Smith"]

Remember: CREATE A DIAGRAM AFTER EVERY NEW FAMILY MEMBER MENTION!`;

// Define the mermaid diagram function
const tools = [
    {
        type: "function" as const,
        function: {
            name: "create_mermaid_diagram",
            description: "Create or update a Mermaid diagram showing family relationships. Call this after EVERY mention of a family member - even if it's just 2-3 people. Build the family tree incrementally by adding each new person as they're mentioned.",
            parameters: {
                type: "object",
                properties: {
                    mermaid_code: {
                        type: "string",
                        description: "The Mermaid diagram code using proper syntax. Use 'graph TD' for direction, clear node names in quotes, and '-->' for relationships."
                    },
                    description: {
                        type: "string",
                        description: "A brief description of what this diagram shows (e.g., 'Family tree showing John, his parents, and siblings')"
                    }
                },
                required: ["mermaid_code", "description"]
            }
        }
    }
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, sessionId } = body; // messages: [{role, content}], sessionId: string

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        // Call OpenAI with function calling enabled
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
            ],
            tools: tools,
            tool_choice: 'auto',
            temperature: 0.7,
        });

        const message = completion.choices[0]?.message;
        let aiMessage = message?.content || '';
        let functionCall = null;
        let mermaidDiagram = null;

        // Check if the model wants to call a function
        if (message?.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            functionCall = {
                name: toolCall.function.name,
                arguments: toolCall.function.arguments
            };

            if (toolCall.function.name === 'create_mermaid_diagram') {
                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    mermaidDiagram = {
                        code: args.mermaid_code,
                        description: args.description
                    };

                    // Provide a response acknowledging the diagram creation
                    aiMessage = `I've created a family tree diagram based on the information you've shared! ${args.description}. Please continue sharing more family details so I can expand the diagram further.`;
                } catch (parseError) {
                    console.error('Error parsing function arguments:', parseError);
                    aiMessage = 'I tried to create a family tree diagram but encountered an error. Let me continue gathering your family information.';
                }
            }
        }

        // Save transcript to S3 (including function call if present)
        const conversationEntry = {
            role: 'assistant',
            content: aiMessage,
            ...(functionCall && { function_call: functionCall }),
            ...(mermaidDiagram && { mermaid_diagram: mermaidDiagram })
        };

        const transcript = JSON.stringify({
            messages: [...messages, conversationEntry],
            sessionId,
            timestamp: Date.now()
        }, null, 2);

        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `family-tree-chats/${sessionId || 'unknown'}-${Date.now()}.json`,
            Body: transcript,
            ContentType: 'application/json',
        };
        await s3.putObject(s3Params).promise();

        return NextResponse.json({
            aiMessage,
            mermaidDiagram,
            functionCall
        });
    } catch (err: any) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
    }
} 