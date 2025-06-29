import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface FamilyTreeAICallProps {
    onClose: () => void;
    mode: 'audio' | 'text';
}

interface Message {
    sender: 'ai' | 'user';
    text: string;
}

const initialQuestions = [
    "Hi! I'm the Family Tree AI agent. Let's figure out where you fit in our family tree!",
    "What is your full name?",
    "Who are your parents?",
    "Do you know your grandparents' names?",
    "Do you have siblings? What are their names?",
    "Where were you born?",
    "Are there any family branches or relatives you know of that might help us connect you?"
];

const FamilyTreeAICall: React.FC<FamilyTreeAICallProps> = ({ onClose, mode }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: initialQuestions[0] },
        { sender: 'ai', text: initialQuestions[1] }
    ]);
    const [input, setInput] = useState('');
    const [questionIndex, setQuestionIndex] = useState(2);
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => uuidv4());
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMessage = { sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        if (mode === 'text') {
            setLoading(true);
            try {
                // Prepare messages for API (role-based)
                const apiMessages = [
                    ...messages.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text })),
                    { role: 'user', content: input }
                ];
                const res = await fetch('/api/family-tree-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: apiMessages, sessionId }),
                });
                const data = await res.json();
                if (data.aiMessage) {
                    setMessages(prev => [...prev, { sender: 'ai' as const, text: data.aiMessage }]);
                } else {
                    setMessages(prev => [...prev, { sender: 'ai' as const, text: 'Sorry, there was an error getting a response.' }]);
                }
            } catch (err) {
                setMessages(prev => [...prev, { sender: 'ai' as const, text: 'Sorry, there was an error connecting to the AI.' }]);
            } finally {
                setLoading(false);
            }
        } else {
            // Simulate AI response with next question (audio mode placeholder)
            setTimeout(() => {
                if (questionIndex < initialQuestions.length) {
                    setMessages(prev => [...prev, { sender: 'ai' as const, text: initialQuestions[questionIndex] }]);
                    setQuestionIndex(q => q + 1);
                } else {
                    setMessages(prev => [...prev, { sender: 'ai' as const, text: "Thank you! We'll use this info to help place you in the family tree." }]);
                }
            }, 800);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative flex flex-col">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">
                    {mode === 'audio' ? 'AI Family Tree Call' : 'AI Family Tree Chat'}
                </h2>
                <div className="mb-4 text-center text-gray-700">
                    <p>
                        The AI agent will ask you questions to help place you in the family tree. Please answer as best as you can!
                        {mode === 'audio' ? ' (Audio call coming soon)' : ' (Text chat only)'}
                    </p>
                </div>
                {/* Chat UI */}
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200" style={{ minHeight: 200, maxHeight: 300 }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-pink-200 text-gray-900' : 'bg-purple-100 text-purple-900'}`}>{msg.text}</div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form className="flex gap-2" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                    <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        autoFocus
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Send'}
                    </button>
                </form>
                {/* Placeholder for audio streaming/recording */}
                {mode === 'audio' && (
                    <div className="mt-4 text-center text-gray-400 text-sm">[Audio streaming & recording coming soon]</div>
                )}
            </div>
        </div>
    );
};

export default FamilyTreeAICall; 