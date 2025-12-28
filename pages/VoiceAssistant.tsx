import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audioUtils';

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<string>("点击说话");
  const [error, setError] = useState<string | null>(null);
  
  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // To store the session object
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize Gemini Client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const stopAudio = () => {
    // Stop all playing audio
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const cleanup = () => {
    stopAudio();
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    if (sessionRef.current) {
        // Attempt to close session if method exists
        try { sessionRef.current.close(); } catch(e) {}
        sessionRef.current = null;
    }
    setIsListening(false);
    setStatus("点击说话");
  };

  const startSession = async () => {
    setError(null);
    setStatus("连接中...");

    try {
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      // Note: We use the promise to ensure we can send data
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus("我在听...");
            setIsListening(true);

            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const outputCtx = outputAudioContextRef.current;
            if (!outputCtx) return;

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus("正在回答...");
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputCtx,
                24000,
                1
              );
              
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                     setStatus("我在听...");
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              stopAudio();
              setStatus("我在听...");
            }
          },
          onclose: () => {
            console.log("Session closed");
            cleanup();
          },
          onerror: (err) => {
            console.error("Session error", err);
            setError("连接出错，请重试");
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are a helpful assistant for an elderly person. Speak clearly, slowly, and warmly in Chinese. Keep answers concise. Call yourself '小夕' (Xiao Xi).",
        },
      });
      
      sessionRef.current = await sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "无法启动语音助手");
      cleanup();
    }
  };

  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSession = () => {
    if (isListening) {
      cleanup();
    } else {
      startSession();
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-orange-400 to-orange-100 flex flex-col items-center pt-12 pb-24 px-6 relative overflow-hidden">
      
      {/* Header replicating image */}
      <div className="w-full flex justify-between items-center text-white mb-8 z-10">
        <button onClick={cleanup} className="text-xl font-bold flex items-center gap-1">
            <span>&lt;</span> 返回
        </button>
        <h1 className="text-2xl font-bold">语音助手</h1>
        <div className="flex gap-2">
            <div className="w-8 h-5 border-2 border-white rounded-md flex justify-center items-center text-xs">...</div>
            <div className="w-5 h-5 border-2 border-white rounded-full flex justify-center items-center text-xs">O</div>
        </div>
      </div>

      {/* Main Status Display */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
         
         {/* Waveform Visualization Placeholder - Static but aesthetic */}
         {isListening && (
           <div className="flex items-center gap-1 h-12 mb-8">
             {[...Array(5)].map((_, i) => (
               <div key={i} className={`w-2 bg-white rounded-full animate-bounce`} style={{ height: '30px', animationDelay: `${i * 0.1}s` }}></div>
             ))}
           </div>
         )}

         {/* Big Microphone Button */}
         <button 
           onClick={toggleSession}
           className={`relative group transition-all duration-300 transform active:scale-95 ${isListening ? 'scale-110' : 'scale-100'}`}
         >
            {/* Ripple Effect */}
            {isListening && (
                <>
                <div className="absolute inset-0 rounded-full bg-orange-600 opacity-20 animate-ping"></div>
                <div className="absolute -inset-4 rounded-full bg-orange-500 opacity-20 animate-pulse"></div>
                </>
            )}
            
            <div className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-colors ${isListening ? 'bg-orange-600' : 'bg-orange-500'}`}>
               {isListening ? (
                 <Volume2 size={80} className="text-white" />
               ) : (
                 <Mic size={80} className="text-white" />
               )}
            </div>
         </button>
         
         <p className="mt-8 text-2xl font-bold text-orange-900 tracking-wide text-center">
            {error ? <span className="text-red-600">{error}</span> : status}
         </p>
         
         <p className="mt-4 text-orange-800/70 text-lg text-center max-w-[80%]">
           {isListening ? "轻点按钮结束对话" : "遇到困难？问问小夕吧"}
         </p>
      </div>
      
      {/* Decorative background circles */}
      <div className="absolute top-1/4 -left-10 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 -right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

    </div>
  );
};

export default VoiceAssistant;