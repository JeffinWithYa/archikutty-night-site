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

    // Audio call state
    const [audioStatus, setAudioStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup effect for audio resources
    useEffect(() => {
        return () => {
            // Cleanup when component unmounts
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Audio call functions
    const startAudioCall = async () => {
        try {
            setAudioStatus('connecting');
            console.log('[AUDIO] Starting audio call...');

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            mediaStreamRef.current = stream;

            // Connect to our WebSocket proxy
            const ws = new WebSocket('ws://localhost:4000');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WS] Connected to proxy');
                // Wait for session.created before sending session.update
            };

            ws.onmessage = (event) => {
                console.log('[WS] Raw message received, type:', typeof event.data, 'data:', event.data);

                // Handle binary data (could be JSON or audio)
                if (event.data instanceof Blob) {
                    console.log('[WS] Received Blob data, size:', event.data.size);
                    const reader = new FileReader();
                    reader.onload = () => {
                        const text = reader.result as string;

                        // Check if this Blob contains JSON
                        if (text.startsWith('{')) {
                            try {
                                const data = JSON.parse(text);
                                console.log('[WS] Blob contained JSON:', data.type, data);

                                // Handle JSON events
                                if (data.type === 'session.created') {
                                    console.log('[WS] Session created, sending session.update');

                                    // NOW send session configuration after receiving session.created
                                    const sessionConfig = {
                                        type: 'session.update',
                                        session: {
                                            modalities: ['audio', 'text'],
                                            instructions: 'You are a helpful family tree assistant for the Archikutty family reunion. Ask questions to help place the user in the family tree. Keep responses conversational and brief.',
                                            voice: 'alloy',
                                            input_audio_format: 'pcm16',
                                            output_audio_format: 'pcm16',
                                            input_audio_transcription: { model: 'whisper-1' },
                                            turn_detection: {
                                                type: 'server_vad',
                                                threshold: 0.5,
                                                prefix_padding_ms: 300,
                                                silence_duration_ms: 500
                                            }
                                        }
                                    };

                                    ws.send(JSON.stringify(sessionConfig));
                                    console.log('[WS] Sent session.update configuration');
                                } else if (data.type === 'session.updated') {
                                    console.log('[WS] Session updated, ready to start conversation');
                                    setAudioStatus('connected');
                                    setIsListening(true);
                                    startRecording();

                                    // Start the conversation with a greeting
                                    setTimeout(() => {
                                        if (ws.readyState === WebSocket.OPEN) {
                                            ws.send(JSON.stringify({
                                                type: 'response.create',
                                                response: {
                                                    modalities: ['audio', 'text']
                                                }
                                            }));
                                            console.log('[WS] Sent response.create to start conversation');
                                        }
                                    }, 500);
                                } else if (data.type === 'response.audio.delta' && data.audio) {
                                    playAudioChunk(data.audio);
                                } else if (data.type === 'error') {
                                    console.error('[WS] OpenAI error:', data.error);
                                    setAudioStatus('error');
                                }
                                return;
                            } catch (e) {
                                console.log('[WS] Blob text is not JSON, treating as audio');
                            }
                        }

                        // If not JSON, treat as binary audio data
                        console.log('[WS] Treating Blob as binary audio data');
                        const audioBytes = new Uint8Array(text.length);
                        for (let i = 0; i < text.length; i++) {
                            audioBytes[i] = text.charCodeAt(i);
                        }
                        const base64Audio = btoa(String.fromCharCode(...audioBytes));
                        playAudioChunk(base64Audio);
                    };
                    reader.readAsText(event.data); // Read as text first to check for JSON
                    return;
                }

                // Handle text/JSON messages
                if (typeof event.data === 'string') {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('[WS] Received JSON:', data.type, data);

                        if (data.type === 'session.created') {
                            console.log('[WS] Session created, sending session.update');

                            // Send session configuration after receiving session.created
                            const sessionConfig = {
                                type: 'session.update',
                                session: {
                                    modalities: ['audio', 'text'],
                                    instructions: 'You are a helpful family tree assistant for the Archikutty family reunion. Ask questions to help place the user in the family tree. Keep responses conversational and brief.',
                                    voice: 'alloy',
                                    input_audio_format: 'pcm16',
                                    output_audio_format: 'pcm16',
                                    input_audio_transcription: { model: 'whisper-1' },
                                    turn_detection: {
                                        type: 'server_vad',
                                        threshold: 0.5,
                                        prefix_padding_ms: 300,
                                        silence_duration_ms: 500
                                    }
                                }
                            };

                            ws.send(JSON.stringify(sessionConfig));
                            console.log('[WS] Sent session.update configuration');
                        } else if (data.type === 'session.updated') {
                            console.log('[WS] Session updated, ready to start conversation');
                            setAudioStatus('connected');
                            setIsListening(true);
                            startRecording();

                            // Start the conversation with a greeting
                            setTimeout(() => {
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(JSON.stringify({
                                        type: 'response.create',
                                        response: {
                                            modalities: ['audio', 'text']
                                        }
                                    }));
                                    console.log('[WS] Sent response.create to start conversation');
                                }
                            }, 500);
                        } else if (data.type === 'response.audio.delta' && data.audio) {
                            // Handle AI audio response (base64 encoded)
                            playAudioChunk(data.audio);
                        } else if (data.type === 'conversation.item.created' && data.item.type === 'message' && data.item.role === 'assistant') {
                            // Handle AI text response
                            if (data.item.content?.[0]?.text) {
                                setMessages(prev => [...prev, { sender: 'ai', text: data.item.content[0].text }]);
                            }
                        } else if (data.type === 'input_audio_buffer.speech_started') {
                            setCurrentTranscript('Listening...');
                        } else if (data.type === 'input_audio_buffer.speech_stopped') {
                            setCurrentTranscript('Processing...');
                        } else if (data.type === 'response.text.delta' && data.delta) {
                            // Handle AI text response streaming
                            setCurrentTranscript(prev => prev + data.delta);
                        } else if (data.type === 'response.text.done') {
                            // Complete text response
                            if (currentTranscript) {
                                setMessages(prev => [...prev, { sender: 'ai', text: currentTranscript }]);
                                setCurrentTranscript('');
                            }
                        } else if (data.type === 'error') {
                            console.error('[WS] OpenAI error:', data.error);
                            setAudioStatus('error');
                        }
                    } catch (err) {
                        console.warn('[WS] Failed to parse JSON message:', err);
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('[WS] Error:', error);
                setAudioStatus('error');
            };

            ws.onclose = () => {
                console.log('[WS] Connection closed');
                setAudioStatus('idle');
                setIsListening(false);
            };

        } catch (error) {
            console.error('[AUDIO] Failed to start call:', error);
            setAudioStatus('error');
        }
    };

    const stopAudioCall = () => {
        console.log('[AUDIO] Stopping audio call...');

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        setAudioStatus('idle');
        setIsListening(false);
        setCurrentTranscript('');
    };

    const startRecording = () => {
        const stream = mediaStreamRef.current;
        const ws = wsRef.current;

        if (!stream || !ws) return;

        const audioContext = new AudioContext({ sampleRate: 24000 });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);

                for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }

                const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

                ws.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: base64Audio
                }));
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
    };

    const playAudioChunk = (base64Audio: string) => {
        try {
            // Decode base64 to binary data
            const binaryString = atob(base64Audio);
            const audioData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                audioData[i] = binaryString.charCodeAt(i);
            }

            // Ensure we have an even number of bytes for 16-bit samples
            if (audioData.length % 2 !== 0) {
                console.warn('[AUDIO] Odd number of bytes, skipping incomplete sample');
                return;
            }

            const audioContext = new AudioContext({ sampleRate: 24000 });
            const numSamples = audioData.length / 2;
            const buffer = audioContext.createBuffer(1, numSamples, 24000);
            const channelData = buffer.getChannelData(0);

            // Convert 16-bit PCM (little-endian) to float32
            for (let i = 0; i < numSamples; i++) {
                const sample = (audioData[i * 2 + 1] << 8) | audioData[i * 2];
                // Convert signed 16-bit to float (-1.0 to 1.0)
                channelData[i] = sample > 32767 ? (sample - 65536) / 32768.0 : sample / 32768.0;
            }

            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();

            console.log('[AUDIO] Playing audio chunk, bytes:', audioData.length, 'samples:', numSamples);
        } catch (error) {
            console.error('[AUDIO] Error playing audio chunk:', error);
        }
    };

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
                        {mode === 'audio' ? ' (Voice conversation with AI)' : ' (Text chat only)'}
                    </p>
                </div>
                {/* Chat UI */}
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200" style={{ minHeight: 200, maxHeight: 300 }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-pink-200 text-gray-900' : 'bg-purple-100 text-purple-900'}`}>{msg.text}</div>
                        </div>
                    ))}
                    {mode === 'audio' && currentTranscript && (
                        <div className="mb-2 flex justify-start">
                            <div className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 italic border-l-4 border-blue-300">
                                {currentTranscript}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                {/* Text Input (Text Mode) */}
                {mode === 'text' && (
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
                )}

                {/* Audio Controls (Audio Mode) */}
                {mode === 'audio' && (
                    <div className="mt-4 text-center space-y-3">
                        {/* Status Display */}
                        <div className="text-gray-600 text-sm">
                            {audioStatus === 'idle' ? (
                                <span className="text-gray-600">Ready to start voice conversation</span>
                            ) : audioStatus === 'connecting' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <span className="text-yellow-600">Connecting to AI...</span>
                                </div>
                            ) : audioStatus === 'connected' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-600">Connected - Speak freely!</span>
                                </div>
                            ) : audioStatus === 'error' ? (
                                <span className="text-red-600">Connection error. Please try again.</span>
                            ) : null}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-3">
                            {audioStatus === 'idle' && (
                                <button
                                    onClick={startAudioCall}
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Start Voice Call
                                </button>
                            )}

                            {(audioStatus === 'connected' || audioStatus === 'connecting') && (
                                <button
                                    onClick={stopAudioCall}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    End Call
                                </button>
                            )}
                        </div>

                        {/* Listening Indicator */}
                        {isListening && (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-blue-600">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="font-semibold">Listening for speech...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FamilyTreeAICall; 