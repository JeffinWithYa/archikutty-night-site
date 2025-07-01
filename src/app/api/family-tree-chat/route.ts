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

CONVERSATION FLOW & SPECIFIC QUESTIONS:
- Most users will start by stating their name (e.g., "Hi, my name is Sarah Johnson")
- When they give you their name, immediately create a simple diagram with just them, then ask: "Great to meet you [Name]! What are your parents' full names?"
- After they give parents, create updated diagram, then ask: "Thanks! Do you have any siblings? If so, what are their names?"
- After siblings, create updated diagram, then ask: "What are your grandparents' names? Let's start with your father's parents."
- After paternal grandparents, create updated diagram, then ask: "And what about your mother's parents?"
- Continue with specific targeted questions like: "Do you have any aunts or uncles?", "Any cousins you'd like to include?", "What about great-grandparents?"

AFTER EACH DIAGRAM CREATION:
- ALWAYS ask a specific, targeted question about the next type of family member
- NEVER say generic things like "tell me more family details" or "continue sharing"
- Follow the systematic progression: name → parents → siblings → grandparents → aunts/uncles → cousins
- Be specific: "What are your siblings' names?" not "tell me about your family"

DIAGRAM CREATION RULES:
- Call create_mermaid_diagram function after each new family member is mentioned
- Start with simple diagrams and expand them progressively
- Always include previously mentioned family members in updated diagrams
- After creating each diagram, immediately ask the next specific question

RESPONSE PATTERN AFTER EACH USER MESSAGE:
1. Call create_mermaid_diagram function with new family members
2. In your text response, acknowledge what was added: "I've added [names] to your family tree!"
3. In the same response, ask the specific next question: "Now, what are your [specific relation] names?"

EXAMPLE RESPONSES:
- After user gives name: "I've created your family tree starting with you! Now, what are your parents' full names?"
- After user gives parents: "I've added your parents to the family tree! Do you have any siblings? If so, what are their names?"
- After user gives siblings: "I've added your siblings! What are your grandparents' names? Let's start with your father's parents."

Use this Mermaid syntax for family trees:
- Use "graph TD" for top-down direction
- Use clear node IDs (like "A[Name]", "B[Name]")  
- Use "-->" for parent-child relationships
- Keep names in quotes and use <br/> for line breaks if needed
- Example: A["Robert Smith"] --> B["John Smith"]

Remember: CREATE DIAGRAM + ASK SPECIFIC NEXT QUESTION!`;

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

        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
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
            parallel_tool_calls: false,
        });

        // Validate OpenAI response
        if (!completion.choices || completion.choices.length === 0) {
            throw new Error('No response from OpenAI');
        }

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

                    // If no text response was provided with the function call, provide a default
                    if (!aiMessage) {
                        aiMessage = `I've created a family tree diagram! ${args.description}`;
                    }
                } catch (parseError) {
                    console.error('Error parsing function arguments:', parseError);
                    aiMessage = 'I tried to create a family tree diagram but encountered an error. Let me continue gathering your family information.';
                }
            }
        }

        // Ensure we always have a response message
        if (!aiMessage) {
            aiMessage = 'I understand. What family member would you like to tell me about?';
        }

        // Save transcript to S3 (including function call if present)
        try {
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

            // Only save to S3 if bucket name is configured
            if (process.env.AWS_S3_BUCKET_NAME) {
                const s3Params = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: `family-tree-chats/${sessionId || 'unknown'}-${Date.now()}.json`,
                    Body: transcript,
                    ContentType: 'application/json',
                };
                await s3.putObject(s3Params).promise();
            } else {
                console.warn('AWS_S3_BUCKET_NAME not configured, skipping S3 save');
            }
        } catch (s3Error) {
            console.error('S3 save failed:', s3Error);
            // Don't let S3 errors break the API response
        }

        return NextResponse.json({
            aiMessage,
            mermaidDiagram,
            functionCall
        });
    } catch (err: any) {
        console.error('Family tree chat API error:', err);

        // Provide more specific error messages
        let errorMessage = 'Failed to get AI response';
        if (err.message?.includes('OpenAI')) {
            errorMessage = 'OpenAI service error';
        } else if (err.message?.includes('API key')) {
            errorMessage = 'API configuration error';
        } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            errorMessage = 'Network connection error';
        }

        return NextResponse.json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }, { status: 500 });
    }
} 