import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

// Error boundary component for Mermaid diagrams
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('MermaidDiagram error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-4 my-3 shadow-sm">
                    <div className="mb-3">
                        <h4 className="text-sm font-semibold text-purple-700 mb-1">🌳 Family Tree Diagram</h4>
                        <p className="text-xs text-gray-600">Error loading diagram</p>
                    </div>
                    <div className="overflow-x-auto bg-red-50 p-3 rounded border flex items-center justify-center" style={{ minHeight: '200px' }}>
                        <div className="text-red-600 text-sm">Unable to display family tree diagram</div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Dynamically import MermaidDiagram to avoid SSR issues
const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), {
    ssr: false,
    loading: () => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 my-3 shadow-sm">
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-purple-700 mb-1">🌳 Family Tree Diagram</h4>
                <p className="text-xs text-gray-600">Loading...</p>
            </div>
            <div className="overflow-x-auto bg-gray-50 p-3 rounded border flex items-center justify-center" style={{ minHeight: '200px' }}>
                <div className="text-gray-500 text-sm">Loading diagram...</div>
            </div>
        </div>
    )
});

interface FamilyTreeAICallProps {
    onClose: () => void;
    mode: 'audio' | 'text';
}

interface Message {
    sender: 'ai' | 'user';
    text: string;
    mermaidDiagram?: {
        code: string;
        description: string;
    };
}

const FamilyTreeAICall: React.FC<FamilyTreeAICallProps> = ({ onClose, mode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => uuidv4());
    const chatEndRef = useRef<HTMLDivElement>(null);

    // WebRTC Audio call state
    const [audioStatus, setAudioStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
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

                callTimeoutRef.current = setTimeout(async () => {
                    console.log('[WEBRTC] Auto-disconnecting after 5 minutes');
                    setMessages(prev => [...prev, {
                        sender: 'ai',
                        text: 'Our family tree session has ended. Thank you for sharing your information!'
                    }]);
                    await stopAudioCall();
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
                    console.log('[WEBRTC] Raw data channel message:', event.data);
                    const data = JSON.parse(event.data);
                    console.log('[WEBRTC] Data channel message:', data.type, data);

                    // Log audio-related events specifically
                    if (data.type.includes('audio') || data.type.includes('response')) {
                        console.log('[AUDIO-EVENT]', data.type, data);
                    }

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
                            } else if (data.item.type === 'function_call') {
                                // Handle function calls from the AI
                                console.log('[WEBRTC] Function call received:', data.item);
                                console.log('[WEBRTC] Function name:', data.item.name);
                                console.log('[WEBRTC] Function call ID:', data.item.call_id);
                                console.log('[WEBRTC] Function arguments type:', typeof data.item.arguments);
                                console.log('[WEBRTC] Function arguments raw:', data.item.arguments);

                                if (data.item.name === 'create_mermaid_diagram') {
                                    // Check if arguments exist and are not empty
                                    if (!data.item.arguments) {
                                        console.log('[WEBRTC] Function call received but arguments are missing or null - waiting for complete arguments event');
                                        // Don't throw error, just skip incomplete function calls
                                        // The complete arguments will come via response.function_call_arguments.done
                                        return;
                                    }

                                    try {
                                        let args;

                                        // Handle both string and object arguments
                                        if (typeof data.item.arguments === 'string') {
                                            console.log('[WEBRTC] Parsing string arguments, length:', data.item.arguments.length);

                                            // Check for empty or whitespace-only strings
                                            if (!data.item.arguments.trim()) {
                                                throw new Error('Function arguments string is empty');
                                            }

                                            // Check for incomplete JSON (common cause of "Unexpected end of JSON input")
                                            const argsString = data.item.arguments.trim();
                                            if (!argsString.startsWith('{') || !argsString.endsWith('}')) {
                                                console.warn('[WEBRTC] Arguments string appears incomplete:', argsString);
                                                throw new Error('Function arguments JSON appears incomplete');
                                            }

                                            args = JSON.parse(data.item.arguments);
                                        } else if (typeof data.item.arguments === 'object') {
                                            console.log('[WEBRTC] Using object arguments directly');
                                            args = data.item.arguments;
                                        } else {
                                            throw new Error(`Invalid arguments type: ${typeof data.item.arguments}`);
                                        }

                                        console.log('[WEBRTC] Parsed function arguments:', args);

                                        // Validate required fields
                                        if (!args || typeof args !== 'object') {
                                            throw new Error('Parsed arguments is not a valid object');
                                        }

                                        if (!args.mermaid_code || !args.description) {
                                            throw new Error(`Missing required fields: mermaid_code=${!!args.mermaid_code}, description=${!!args.description}`);
                                        }

                                        const mermaidMessage: Message = {
                                            sender: 'ai',
                                            text: `I've created a family tree diagram! ${args.description}`,
                                            mermaidDiagram: {
                                                code: args.mermaid_code,
                                                description: args.description
                                            }
                                        };
                                        console.log('[WEBRTC] Created mermaid message:', mermaidMessage);
                                        setMessages(prev => [...prev, mermaidMessage]);

                                        // Send function output back to the conversation
                                        const functionOutput = {
                                            type: 'conversation.item.create',
                                            item: {
                                                type: 'function_call_output',
                                                call_id: data.item.call_id,
                                                output: JSON.stringify({
                                                    success: true,
                                                    message: 'Mermaid diagram created successfully and displayed to user'
                                                })
                                            }
                                        };
                                        dataChannel.send(JSON.stringify(functionOutput));
                                    } catch (parseError) {
                                        console.error('[WEBRTC] Error parsing function arguments:', parseError);
                                        console.error('[WEBRTC] Original arguments:', data.item.arguments);

                                        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';

                                        // Add a fallback message to the chat when function call fails
                                        const fallbackMessage: Message = {
                                            sender: 'ai',
                                            text: `I'm having trouble creating the family tree diagram right now, but I'm still gathering your family information. Please continue sharing details about your family members.`
                                        };
                                        setMessages(prev => [...prev, fallbackMessage]);

                                        // Send error back to the conversation
                                        const functionOutput = {
                                            type: 'conversation.item.create',
                                            item: {
                                                type: 'function_call_output',
                                                call_id: data.item.call_id,
                                                output: JSON.stringify({
                                                    success: false,
                                                    error: `Failed to parse diagram parameters: ${errorMessage}`,
                                                    user_message: 'Please continue sharing family information'
                                                })
                                            }
                                        };
                                        dataChannel.send(JSON.stringify(functionOutput));
                                    }
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
                            console.log('[AUDIO-TRANSCRIPT] Audio transcript done:', data);
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
                        case 'response.audio.delta':
                            console.log('[AUDIO-DELTA] Received audio data chunk');
                            break;
                        case 'response.audio.done':
                            console.log('[AUDIO-DONE] Audio response completed');
                            break;
                        case 'response.function_call_arguments.done':
                            // This is the proper way to receive complete function call arguments in Realtime API
                            console.log('[WEBRTC] Function call arguments completed:', data);
                            if (data.name === 'create_mermaid_diagram') {
                                try {
                                    let args;

                                    // Parse the complete arguments
                                    if (typeof data.arguments === 'string') {
                                        console.log('[WEBRTC] Parsing complete function arguments');
                                        args = JSON.parse(data.arguments);
                                    } else if (typeof data.arguments === 'object') {
                                        args = data.arguments;
                                    } else {
                                        throw new Error(`Invalid complete arguments type: ${typeof data.arguments}`);
                                    }

                                    console.log('[WEBRTC] Complete function arguments:', args);

                                    // Validate required fields
                                    if (!args || typeof args !== 'object') {
                                        throw new Error('Complete arguments is not a valid object');
                                    }

                                    if (!args.mermaid_code || !args.description) {
                                        throw new Error(`Missing required fields in complete args: mermaid_code=${!!args.mermaid_code}, description=${!!args.description}`);
                                    }

                                    const mermaidMessage: Message = {
                                        sender: 'ai',
                                        text: `I've created a family tree diagram! ${args.description}`,
                                        mermaidDiagram: {
                                            code: args.mermaid_code,
                                            description: args.description
                                        }
                                    };
                                    console.log('[WEBRTC] Created mermaid message from complete args:', mermaidMessage);
                                    setMessages(prev => [...prev, mermaidMessage]);

                                    // Send function output back to the conversation
                                    const functionOutput = {
                                        type: 'conversation.item.create',
                                        item: {
                                            type: 'function_call_output',
                                            call_id: data.call_id,
                                            output: JSON.stringify({
                                                success: true,
                                                message: 'Mermaid diagram created successfully and displayed to user'
                                            })
                                        }
                                    };
                                    dataChannel.send(JSON.stringify(functionOutput));

                                    // After successful function call, trigger AI to continue with audio response
                                    setTimeout(() => {
                                        console.log('[WEBRTC] Requesting audio response after function call');
                                        const continueResponse = {
                                            type: 'response.create',
                                            response: {
                                                modalities: ['audio', 'text'],
                                                instructions: 'Continue the conversation with audio. Ask the next question about family members.'
                                            }
                                        };
                                        dataChannel.send(JSON.stringify(continueResponse));
                                    }, 100);
                                } catch (parseError) {
                                    console.error('[WEBRTC] Error parsing complete function arguments:', parseError);
                                    console.error('[WEBRTC] Complete arguments data:', data.arguments);

                                    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';

                                    // Add a fallback message to the chat when function call fails
                                    const fallbackMessage: Message = {
                                        sender: 'ai',
                                        text: `I'm having trouble creating the family tree diagram right now, but I'm still gathering your family information. Please continue sharing details about your family members.`
                                    };
                                    setMessages(prev => [...prev, fallbackMessage]);

                                    // Send error back to the conversation
                                    const functionOutput = {
                                        type: 'conversation.item.create',
                                        item: {
                                            type: 'function_call_output',
                                            call_id: data.call_id,
                                            output: JSON.stringify({
                                                success: false,
                                                error: `Failed to parse complete diagram parameters: ${errorMessage}`,
                                                user_message: 'Please continue sharing family information'
                                            })
                                        }
                                    };
                                    dataChannel.send(JSON.stringify(functionOutput));
                                }
                            }
                            break;
                        case 'error':
                            console.error('[WEBRTC] OpenAI error:', data.error);
                            setAudioStatus('error');
                            setTimeout(async () => {
                                await stopAudioCall();
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
                console.log('[WEBRTC] Track details:', {
                    kind: event.track.kind,
                    readyState: event.track.readyState,
                    enabled: event.track.enabled,
                    streamCount: event.streams.length
                });

                const [remoteStream] = event.streams;
                console.log('[WEBRTC] Remote stream details:', {
                    id: remoteStream.id,
                    active: remoteStream.active,
                    audioTracks: remoteStream.getAudioTracks().length,
                    videoTracks: remoteStream.getVideoTracks().length
                });

                // Create audio element and play remote stream
                const audio = new Audio();
                audio.srcObject = remoteStream;
                audio.autoplay = true;
                audio.volume = 1.0; // Ensure volume is at max
                remoteAudioRef.current = audio;

                // Add event listeners for audio debugging
                audio.addEventListener('loadstart', () => console.log('[AUDIO] Load started'));
                audio.addEventListener('loadeddata', () => console.log('[AUDIO] Data loaded'));
                audio.addEventListener('canplay', () => console.log('[AUDIO] Can play'));
                audio.addEventListener('play', () => console.log('[AUDIO] Started playing'));
                audio.addEventListener('pause', () => console.log('[AUDIO] Paused'));
                audio.addEventListener('ended', () => console.log('[AUDIO] Ended'));
                audio.addEventListener('error', (e) => console.error('[AUDIO] Error:', e));

                // Handle audio playback on mobile Safari
                audio.play().then(() => {
                    console.log('[AUDIO] Successfully started playback');
                }).catch(error => {
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

        // Save voice chat data before cleanup
        await saveVoiceChatData();

        cleanup();
        setAudioStatus('idle');
        setIsListening(false);
        setCurrentTranscript('');
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMessage = { sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);

        if (mode === 'text') {
            setLoading(true);
            try {
                // Prepare messages for API (role-based) - use userMessage.text instead of input
                const apiMessages = [
                    ...messages.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text })),
                    { role: 'user', content: userMessage.text }
                ];
                setInput(''); // Clear input after preparing API messages
                const res = await fetch('/api/family-tree-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: apiMessages, sessionId }),
                });
                const data = await res.json();
                console.log('[DEBUG] API Response:', data);
                if (data.aiMessage) {
                    const newMessage: Message = {
                        sender: 'ai' as const,
                        text: data.aiMessage,
                        ...(data.mermaidDiagram && { mermaidDiagram: data.mermaidDiagram })
                    };
                    console.log('[DEBUG] New message with diagram:', newMessage);
                    setMessages(prev => [...prev, newMessage]);
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
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full relative flex flex-col" style={{ maxHeight: '90vh' }}>
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
                    <p className="text-sm text-gray-600 mb-2">
                        Begin by sharing your name, and watch your family tree grow as you tell us about your relatives. The AI creates visual diagrams as you chat!
                    </p>
                    <p className="text-xs text-gray-500">
                        Your conversation helps the Archikutty committee organize the family tree for the reunion.
                    </p>

                    {/* Disclaimers */}
                    <div className="mt-3 space-y-3">
                        {/* Diagram Accuracy Disclaimer */}
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
                            <div className="flex items-start gap-2">
                                <div className="text-amber-600 text-sm mt-0.5">⚠️</div>
                                <div>
                                    <p className="text-xs text-amber-800 font-medium mb-1">Diagram Accuracy Notice</p>
                                    <p className="text-xs text-amber-700">
                                        Family tree diagrams created during conversation may not be perfectly accurate.
                                        <strong> Don't worry!</strong> We will analyze all conversations to create
                                        the real, detailed family tree for the reunion.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Issues Disclaimer */}
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-left">
                            <div className="flex items-start gap-2">
                                <div className="text-green-600 text-sm mt-0.5">🔄</div>
                                <div>
                                    <p className="text-xs text-green-800 font-medium mb-1">Network Issues?</p>
                                    <p className="text-xs text-green-700">
                                        If your chat gets interrupted or you experience network hiccups,
                                        <strong> simply close and restart the chat.</strong> Each conversation is saved
                                        independently.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

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
                {/* Chat and Family Tree Layout */}
                <div className="flex-1 flex gap-4 mb-4" style={{ minHeight: 400, maxHeight: 500 }}>
                    {/* Chat Messages */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 Conversation</h3>
                        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 italic py-8">
                                    {mode === 'audio'
                                        ? 'Click "Start Voice Call" and say your name to begin.'
                                        : 'Type your full name to start building your family tree.'
                                    }
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`mb-2 ${msg.sender === 'user' ? 'flex justify-end' : ''}`}>
                                    {msg.sender === 'user' ? (
                                        <div className="px-4 py-2 rounded-lg bg-pink-200 text-gray-900 max-w-xs">{msg.text}</div>
                                    ) : (
                                        <div className="px-4 py-2 rounded-lg bg-purple-100 text-purple-900 max-w-xs">{msg.text}</div>
                                    )}
                                </div>
                            ))}
                            {mode === 'audio' && currentTranscript && (
                                <div className="mb-2 flex justify-start">
                                    <div className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 italic border-l-4 border-blue-300 max-w-xs">
                                        {currentTranscript}
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Family Tree Diagrams */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">🌳 Your Family Tree</h3>
                        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {(() => {
                                const diagramMessages = messages.filter(msg => msg.mermaidDiagram);
                                console.log('[DEBUG] Messages with diagrams:', diagramMessages.length);
                                console.log('[DEBUG] All messages:', messages);
                                return diagramMessages.length === 0 ? (
                                    <div className="text-center text-gray-500 italic py-8">
                                        Family tree diagrams will appear here as you share information
                                        <div className="text-xs mt-2">
                                            Debug: {messages.length} total messages, {diagramMessages.length} with diagrams
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages
                                            .filter(msg => msg.mermaidDiagram && msg.mermaidDiagram.code)
                                            .map((msg, idx) => (
                                                <ErrorBoundary key={idx}>
                                                    <MermaidDiagram
                                                        code={msg.mermaidDiagram!.code}
                                                        description={msg.mermaidDiagram!.description || 'Family tree diagram'}
                                                    />
                                                </ErrorBoundary>
                                            ))
                                        }
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                {/* Text Input (Text Mode) */}
                {mode === 'text' && (
                    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                        <input
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={messages.length === 0 ? "Start by typing your full name..." : "Type your response..."}
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