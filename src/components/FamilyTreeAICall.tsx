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

const FamilyTreeAICall: React.FC<FamilyTreeAICallProps> = ({ onClose, mode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => uuidv4());
    const chatEndRef = useRef<HTMLDivElement>(null);

    // WebRTC Audio call state
    const [audioStatus, setAudioStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error'>('idle');
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitialResponseRef = useRef<boolean>(false);
    const callStartTimeRef = useRef<number | null>(null);
    const audioRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const mixerRef = useRef<any>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup effect for WebRTC resources
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setTimeRemaining(0);
        hasInitialResponseRef.current = false;
        callStartTimeRef.current = null;

        // Stop audio recording if active
        if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
            audioRecorderRef.current.stop();
        }
        audioRecorderRef.current = null;
        recordedChunksRef.current = [];
        mixerRef.current = null;

        if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
            remoteAudioRef.current = null;
        }
    };

    // WebRTC Audio call functions
    const startAudioCall = async () => {
        try {
            setAudioStatus('connecting');
            console.log('[WEBRTC] Starting WebRTC audio call...');

            // Step 1: Get ephemeral token from our API
            console.log('[WEBRTC] Fetching ephemeral token...');
            const tokenResponse = await fetch('/api/realtime-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!tokenResponse.ok) {
                const error = await tokenResponse.json();
                throw new Error(`Token fetch failed: ${error.error}`);
            }

            const { token } = await tokenResponse.json();
            console.log('[WEBRTC] Got ephemeral token');

            // Step 2: Get user media
            console.log('[WEBRTC] Requesting microphone access...');
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
            console.log('[WEBRTC] Got microphone access');

            // Create audio context for mixing local and remote audio
            try {
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;

                // Create destination for mixed audio
                const mixer = audioContext.createMediaStreamDestination();
                mixerRef.current = mixer;

                // Add local microphone to mixer
                const localSource = audioContext.createMediaStreamSource(stream);
                localSource.connect(mixer);

                // Start recording with just local audio for now (remote will be added when received)
                const recorder = new MediaRecorder(mixer.stream, {
                    mimeType: 'audio/webm;codecs=opus'
                });

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    console.log('[RECORDING] Audio recording stopped');
                };

                recorder.start(1000); // Collect data every 1 second
                audioRecorderRef.current = recorder;
                console.log('[RECORDING] Started mixed audio recording for S3 storage');
            } catch (recordingError) {
                console.warn('[RECORDING] Failed to start audio recording:', recordingError);
            }

            // Step 3: Create RTCPeerConnection
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });
            peerConnectionRef.current = peerConnection;

            // Step 4: Add audio track
            stream.getAudioTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
            console.log('[WEBRTC] Added audio track to peer connection');

            // Step 5: Create data channel for events
            const dataChannel = peerConnection.createDataChannel('realtime', {
                ordered: true
            });
            dataChannelRef.current = dataChannel;

            dataChannel.onopen = () => {
                console.log('[WEBRTC] Data channel opened');
                setAudioStatus('connected');
                setIsListening(true);

                // Track call start time
                callStartTimeRef.current = Date.now();

                // Send an initial message to start the conversation
                const startMessage = {
                    type: 'response.create',
                    response: {
                        modalities: ['audio', 'text']
                        // Instructions are now pre-configured in the ephemeral token
                    }
                };

                setTimeout(() => {
                    if (!hasInitialResponseRef.current) {
                        dataChannel.send(JSON.stringify(startMessage));
                        hasInitialResponseRef.current = true;
                        console.log('[WEBRTC] Sent initial greeting using ephemeral token configuration');
                    }
                }, 1000); // Small delay to ensure connection is fully established

                // Set up auto-disconnect after 5 minutes
                const callDuration = 5 * 60 * 1000; // 5 minutes
                setTimeRemaining(300); // 5 minutes in seconds

                callTimeoutRef.current = setTimeout(() => {
                    console.log('[WEBRTC] Auto-disconnecting after 5 minutes');
                    setMessages(prev => [...prev, {
                        sender: 'ai',
                        text: 'Our family tree session has ended. Thank you for sharing your information!'
                    }]);
                    stopAudioCall(); // Remove await for faster disconnect
                }, callDuration);

                // Start countdown timer
                countdownIntervalRef.current = setInterval(() => {
                    setTimeRemaining(prev => {
                        if (prev <= 1) {
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            };

            dataChannel.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('[WEBRTC] Data channel message:', data.type, data);

                    switch (data.type) {
                        case 'session.created':
                            // Ensure we're in connected state when session is created
                            setAudioStatus('connected');
                            break;
                        case 'conversation.item.created':
                            if (data.item.type === 'message' && data.item.role === 'assistant') {
                                if (data.item.content?.[0]?.text) {
                                    setMessages(prev => [...prev, {
                                        sender: 'ai',
                                        text: data.item.content[0].text
                                    }]);
                                }
                            }
                            break;
                        case 'input_audio_buffer.speech_started':
                            setCurrentTranscript('Listening...');
                            break;
                        case 'input_audio_buffer.speech_stopped':
                            setCurrentTranscript('Processing...');
                            break;
                        case 'conversation.item.input_audio_transcription.completed':
                            if (data.transcript) {
                                setMessages(prev => [...prev, {
                                    sender: 'user',
                                    text: data.transcript
                                }]);
                            }
                            break;
                        case 'response.text.delta':
                            if (data.delta) {
                                setCurrentTranscript(prev => prev + data.delta);
                            }
                            break;
                        case 'response.text.done':
                            if (currentTranscript) {
                                setMessages(prev => [...prev, {
                                    sender: 'ai',
                                    text: currentTranscript
                                }]);
                                setCurrentTranscript('');
                            }
                            break;
                        case 'response.audio_transcript.delta':
                            if (data.delta) {
                                setCurrentTranscript(prev => prev + data.delta);
                            }
                            break;
                        case 'response.audio_transcript.done':
                            if (data.transcript) {
                                setMessages(prev => [...prev, {
                                    sender: 'ai',
                                    text: data.transcript
                                }]);
                                setCurrentTranscript('');
                            } else if (currentTranscript) {
                                setMessages(prev => [...prev, {
                                    sender: 'ai',
                                    text: currentTranscript
                                }]);
                                setCurrentTranscript('');
                            }
                            break;
                        case 'error':
                            console.error('[WEBRTC] OpenAI error:', data.error);
                            setAudioStatus('error');
                            setTimeout(() => {
                                stopAudioCall(); // Remove await for faster disconnect
                            }, 2000); // Auto-disconnect on error after 2 seconds
                            break;
                    }
                } catch (err) {
                    console.warn('[WEBRTC] Failed to parse data channel message:', err);
                }
            };

            // Step 6: Handle remote audio stream
            peerConnection.ontrack = (event) => {
                console.log('[WEBRTC] Received remote audio track');
                const [remoteStream] = event.streams;

                // Create audio element and play remote stream
                const audio = new Audio();
                audio.srcObject = remoteStream;
                audio.autoplay = true;
                remoteAudioRef.current = audio;

                // Handle audio playback on mobile Safari
                audio.play().catch(error => {
                    console.warn('[WEBRTC] Audio autoplay failed, user interaction required:', error);
                });

                // Add remote audio to our recording mixer
                try {
                    if (audioContextRef.current && mixerRef.current) {
                        const remoteSource = audioContextRef.current.createMediaStreamSource(remoteStream);
                        remoteSource.connect(mixerRef.current);
                        console.log('[RECORDING] Added remote audio to mixer');
                    }
                } catch (mixerError) {
                    console.warn('[RECORDING] Failed to add remote audio to mixer:', mixerError);
                }
            };

            // Step 7: Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('[WEBRTC] ICE candidate:', event.candidate);
                }
            };

            // Step 8: Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
                console.log('[WEBRTC] Connection state:', peerConnection.connectionState);

                switch (peerConnection.connectionState) {
                    case 'connected':
                        // Don't override if already connected via data channel
                        if (audioStatus !== 'connected') {
                            setAudioStatus('connected');
                            setIsListening(true);
                        }
                        break;
                    case 'disconnected':
                        setAudioStatus('idle');
                        setIsListening(false);
                        break;
                    case 'failed':
                    case 'closed':
                        setAudioStatus('idle');
                        setIsListening(false);
                        cleanup();
                        break;
                }
            };

            // Step 9: Create offer and set local description
            console.log('[WEBRTC] Creating offer...');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Step 10: Send offer to OpenAI Realtime API (using ephemeral token)
            console.log('[WEBRTC] Sending offer to OpenAI with ephemeral token...');

            // No need to send model, voice, or instructions - they're configured in the ephemeral token
            const baseUrl = 'https://api.openai.com/v1/realtime';

            const realtimeResponse = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
                    'Authorization': `Bearer ${token}`
                },
                body: peerConnection.localDescription?.sdp
            });

            if (!realtimeResponse.ok) {
                throw new Error(`WebRTC handshake failed: ${realtimeResponse.status}`);
            }

            const answerSdp = await realtimeResponse.text();
            console.log('[WEBRTC] Got answer from OpenAI');

            // Step 11: Set remote description
            await peerConnection.setRemoteDescription({
                type: 'answer',
                sdp: answerSdp
            });

            console.log('[WEBRTC] WebRTC connection established!');

        } catch (error) {
            console.error('[WEBRTC] Failed to start call:', error);
            setAudioStatus('error');
            cleanup();
        }
    };

    // Function to save voice chat data to S3
    const saveVoiceChatData = async () => {
        try {
            const callDuration = callStartTimeRef.current
                ? Math.round((Date.now() - callStartTimeRef.current) / 1000)
                : 0;

            // Save transcript
            console.log('[S3] Attempting to save transcript with', messages.length, 'messages');
            if (messages.length > 0) {
                const transcriptResponse = await fetch('/api/save-voice-transcript', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages,
                        sessionId,
                        callDuration,
                        metadata: {
                            userAgent: navigator.userAgent,
                            timestamp: Date.now(),
                            endReason: 'user_ended'
                        }
                    })
                });

                if (transcriptResponse.ok) {
                    const result = await transcriptResponse.json();
                    console.log('[S3] Voice transcript saved successfully:', result);
                } else {
                    const error = await transcriptResponse.text();
                    console.error('[S3] Failed to save voice transcript:', error);
                }
            } else {
                console.log('[S3] No messages to save for transcript');
            }

            // Save raw audio if available
            console.log('[S3] Attempting to save audio with', recordedChunksRef.current.length, 'chunks');
            if (recordedChunksRef.current.length > 0) {
                const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                console.log('[S3] Audio blob size:', audioBlob.size, 'bytes');

                const formData = new FormData();
                formData.append('audio', audioBlob, `voice-call-${sessionId}-${Date.now()}.webm`);
                formData.append('sessionId', sessionId);
                formData.append('callDuration', callDuration.toString());

                const audioResponse = await fetch('/api/save-voice-audio', {
                    method: 'POST',
                    body: formData
                });

                if (audioResponse.ok) {
                    const result = await audioResponse.json();
                    console.log('[S3] Voice audio saved successfully:', result);
                } else {
                    const error = await audioResponse.text();
                    console.error('[S3] Failed to save voice audio:', error);
                }
            } else {
                console.log('[S3] No audio chunks to save');
            }
        } catch (error) {
            console.error('[S3] Error saving voice chat data:', error);
        }
    };

    const stopAudioCall = async () => {
        console.log('[WEBRTC] Stopping audio call...');

        // Immediately show disconnecting state to user
        setAudioStatus('disconnecting');
        setIsListening(false);
        setCurrentTranscript('');

        // Immediately cleanup connections (this is fast)
        cleanup();

        // Brief delay to show disconnecting state, then set to idle
        setTimeout(() => {
            setAudioStatus('idle');
        }, 300); // Small delay so user sees the "Disconnecting..." feedback

        // Save voice chat data in background (don't block UI)
        saveVoiceChatData().then(() => {
            console.log('[WEBRTC] Voice data saved successfully in background');
        }).catch((error) => {
            console.error('[WEBRTC] Background save failed:', error);
        });
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
            // Audio mode - the AI will respond via WebRTC voice call
            // No need for simulated responses since real AI handles this
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
                    <p className="mb-2">
                        {mode === 'audio' ? 'Start a voice conversation' : 'Start a text chat'} with our AI agent to help build the Archikutty family tree!
                    </p>
                    <p className="text-sm text-gray-600">
                        The AI will gather information about your family connections to help the Archikutty committee organize and update the family tree for the reunion.
                    </p>
                    {mode === 'audio' && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                            <p className="text-xs text-blue-800 font-medium mb-1">💡 Voice Chat Tips:</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• <strong>If you interrupt the AI:</strong> Just ask "please continue" or say your full name if it's the start</li>
                                <li>• <strong>If the call drops:</strong> Simply click "Start Voice Call" again</li>
                                <li>• <strong>Best results:</strong> Wait for the AI to finish speaking before responding</li>
                            </ul>
                        </div>
                    )}
                </div>
                {/* Chat UI */}
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200" style={{ minHeight: 200, maxHeight: 300 }}>
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 italic py-8">
                            {mode === 'audio'
                                ? 'Click "Start Voice Call" to begin your conversation with the AI agent.'
                                : 'Start typing to begin your conversation with the AI agent.'
                            }
                        </div>
                    )}
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
                            ) : audioStatus === 'disconnecting' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                    <span className="text-orange-600">Disconnecting...</span>
                                </div>
                            ) : audioStatus === 'error' ? (
                                <div className="text-center">
                                    <span className="text-red-600 block">Connection error occurred</span>
                                    <span className="text-xs text-gray-500">Click "Try Again" to reconnect</span>
                                </div>
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
                                    {audioStatus === 'connecting' ? 'Cancel' : 'End Call'}
                                </button>
                            )}

                            {audioStatus === 'disconnecting' && (
                                <button
                                    disabled
                                    className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg cursor-not-allowed flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Disconnecting...
                                </button>
                            )}

                            {audioStatus === 'error' && (
                                <button
                                    onClick={() => setAudioStatus('idle')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Try Again
                                </button>
                            )}
                        </div>

                        {/* Time Remaining */}
                        {audioStatus === 'connected' && timeRemaining > 0 && (
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">
                                    Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs text-gray-500">
                                    💡 If conversation gets stuck, say "please continue" or your name
                                </div>
                            </div>
                        )}

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