import { useState, useRef, useCallback, useEffect } from 'react';

// Embed the processor code directly to avoid file path/loading issues in different envs
const PCM_PROCESSOR_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Gemini requires 16kHz PCM 16-bit signed integer format.
    // We buffer samples to send efficient chunks to the main thread/websocket.
    // 2048 samples @ 16kHz = 128ms latency.
    this.bufferSize = 2048; 
    this.buffer = new Int16Array(this.bufferSize);
    this.offset = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0]; // Mono audio

    for (let i = 0; i < channelData.length; i++) {
      // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
      const s = Math.max(-1, Math.min(1, channelData[i]));
      this.buffer[this.offset] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      this.offset++;

      // When buffer is full, send to main thread
      if (this.offset >= this.bufferSize) {
        this.port.postMessage(this.buffer);
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
`;

// --- Utility Functions ---

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// --- Hook Implementation ---

export const useLiveAudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);

  // Contexts
  // Input: 16kHz is the required sample rate for Gemini input
  const inputContextRef = useRef<AudioContext | null>(null);
  // Output: 24kHz is the native sample rate of Gemini output
  const outputContextRef = useRef<AudioContext | null>(null);
  
  const workletLoadedRef = useRef<boolean>(false);
  
  // Worklet & Stream
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Playback Queue Management
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize Audio Contexts
  const ensureContexts = async () => {
    if (!inputContextRef.current) {
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
    }

    if (!outputContextRef.current) {
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    
    // Load worklet from blob to avoid file path issues
    if (inputContextRef.current && !workletLoadedRef.current) {
        try {
            const blob = new Blob([PCM_PROCESSOR_CODE], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            await inputContextRef.current.audioWorklet.addModule(url);
            URL.revokeObjectURL(url); // Clean up
            workletLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load audio worklet:", error);
            throw error;
        }
    }
    
    // Resume if suspended (browser policy)
    if (inputContextRef.current?.state === 'suspended') {
        await inputContextRef.current.resume();
    }
    if (outputContextRef.current?.state === 'suspended') {
        await outputContextRef.current.resume();
    }
  };

  const startRecording = useCallback(async (onData: (base64: string) => void) => {
    try {
      await ensureContexts();
      const ctx = inputContextRef.current!;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, 'pcm-processor');
      
      worklet.port.onmessage = (event) => {
        const int16Array = event.data as Int16Array;
        
        // Calculate simple volume level for UI
        let sum = 0;
        for (let i = 0; i < int16Array.length; i += 10) { // Skip samples for perf
           sum += Math.abs(int16Array[i]);
        }
        const avg = sum / (int16Array.length / 10);
        setVolume(Math.min(100, avg / 100)); // Normalize roughly

        // Convert to base64 for Gemini
        const base64 = arrayBufferToBase64(int16Array.buffer);
        onData(base64);
      };

      source.connect(worklet);
      worklet.connect(ctx.destination); // Keep chain alive
      
      workletNodeRef.current = worklet;
      setIsRecording(true);

    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    setIsRecording(false);
    setVolume(0);
  }, []);

  const playAudioChunk = useCallback(async (base64Audio: string) => {
    try {
        // Ensure context is ready (and resumed)
        await ensureContexts();
        const ctx = outputContextRef.current;
        
        if (!ctx) return;

        // 1. Decode Base64 to ArrayBuffer
        const arrayBuffer = base64ToArrayBuffer(base64Audio);
        
        // 2. Convert Raw Int16 PCM to Float32 (Web Audio standard)
        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        // 3. Create AudioBuffer
        const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.copyToChannel(float32Array, 0);

        // 4. Schedule Playback
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        // Gapless playback logic
        const currentTime = ctx.currentTime;
        // If the next start time is in the past, reset it to now (handle latency/drifts)
        if (nextStartTimeRef.current < currentTime) {
            nextStartTimeRef.current = currentTime;
        }
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;

        // Track source state
        scheduledSourcesRef.current.add(source);
        setIsPlaying(true);

        source.onended = () => {
            scheduledSourcesRef.current.delete(source);
            if (scheduledSourcesRef.current.size === 0) {
                setIsPlaying(false);
                // Reset cursor if silence persists to avoid latency buildup
                // Only reset if we are significantly behind current time
                if (ctx.currentTime > nextStartTimeRef.current + 0.5) {
                    nextStartTimeRef.current = ctx.currentTime;
                }
            }
        };

    } catch (error) {
      console.error("Error playing audio chunk:", error);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    scheduledSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
      stopPlayback();
      
      if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
      }
      workletLoadedRef.current = false;
      
      if (outputContextRef.current) {
        outputContextRef.current.close();
        outputContextRef.current = null;
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    playAudioChunk,
    stopPlayback,
    isRecording,
    isPlaying,
    volume
  };
};