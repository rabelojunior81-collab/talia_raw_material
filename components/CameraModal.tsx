import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Circle, StopCircle, Camera, VideoRecorder } from './icons/Icons';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera(); // Ensure cleanup first
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        },
        audio: mode === 'video' // Only request audio if needed or planning to record
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleMode = () => {
    if (isRecording) return; // Prevent switching while recording
    setMode(prev => prev === 'photo' ? 'video' : 'photo');
    // Restart camera to include/exclude audio permissions if strict, 
    // but usually requesting audio upfront is better. 
    // For simplicity, we'll keep the current stream if possible or re-request if we want to be strict.
    // Re-requesting is safer for permissions.
    setTimeout(() => startCamera(), 100); 
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Flip if user facing
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const startRecordingVideo = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    // Prefer webm or mp4 depending on browser
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
        
    try {
        const recorder = new MediaRecorder(stream, { mimeType });
        
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };
        
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const file = new File([blob], `video_${Date.now()}.webm`, { type: mimeType });
            onCapture(file);
            onClose();
        };
        
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
    } catch (e) {
        console.error("Recorder error:", e);
        setError("Erro ao iniciar gravação.");
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleTrigger = () => {
    if (mode === 'photo') {
        takePhoto();
    } else {
        if (isRecording) {
            stopRecordingVideo();
        } else {
            startRecordingVideo();
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
        {/* Viewfinder */}
        <div className="relative flex-grow bg-black overflow-hidden flex items-center justify-center">
             {/* Video Element */}
             <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-6 text-center">
                    <p>{error}</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 rounded">Fechar</button>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
            
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={onClose} className="p-2 text-white hover:text-red-500 transition-colors">
                    <X className="w-8 h-8" />
                </button>
                <button onClick={switchCamera} className="p-2 text-white hover:text-gray-300 transition-colors">
                    <RotateCcw className="w-8 h-8" />
                </button>
            </div>
            
            {/* Recording Indicator */}
            {isRecording && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white text-xs font-bold uppercase">Gravando</span>
                </div>
            )}
        </div>

        {/* Controls Footer */}
        <div className="flex-shrink-0 h-32 bg-black flex flex-col items-center justify-center relative">
            
            {/* Mode Switcher (Small toggle) */}
             <div className="absolute top-[-40px] flex gap-4 bg-black/50 rounded-full px-4 py-2 backdrop-blur-sm">
                <button 
                    onClick={() => mode !== 'photo' && toggleMode()}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'photo' ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                    Foto
                </button>
                <button 
                    onClick={() => mode !== 'video' && toggleMode()}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'video' ? 'text-red-500' : 'text-gray-400'}`}
                >
                    Vídeo
                </button>
            </div>

            <div className="flex items-center justify-center w-full gap-8">
                {/* Left Placeholder (Gallery could go here) */}
                <div className="w-12"></div>
                
                {/* Shutter Button */}
                <button 
                    onClick={handleTrigger}
                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-200 active:scale-95 ${
                        mode === 'video' 
                            ? (isRecording ? 'border-red-500 bg-red-600/20' : 'border-white bg-red-600') 
                            : 'border-white bg-white/90'
                    }`}
                >
                    {mode === 'video' && isRecording ? (
                        <div className="w-8 h-8 bg-red-500 rounded-sm"></div>
                    ) : (
                        <div className={`w-16 h-16 rounded-full ${mode === 'video' ? 'bg-transparent' : 'bg-transparent border border-gray-300'}`}></div>
                    )}
                </button>

                 {/* Right Placeholder */}
                 <div className="w-12"></div>
            </div>
        </div>
    </div>
  );
};

export default CameraModal;