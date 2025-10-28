'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { transcriptionService } from '@/services/transcriptionService';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onTranscriptionStart?: () => void;
  language?: string;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  onTranscriptionStart,
  language = 'es',
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!transcriptionService.isRecordingSupported()) {
        toast.error('Tu navegador no soporta grabación de audio');
        return;
      }

      const stream = await transcriptionService.getUserMedia();
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setHasRecording(true);
        
        // Create audio URL for playback
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Grabación iniciada');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      toast.success('Grabación finalizada');
    }
  };

  const playRecording = () => {
    if (audioRef.current && hasRecording) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
    
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      toast.error('No hay grabación para transcribir');
      return;
    }

    setIsTranscribing(true);
    onTranscriptionStart?.();

    try {
      const response = await transcriptionService.transcribeAudio(audioBlob, language);
      
      if (response.success && response.data) {
        onTranscriptionComplete(response.data.transcription);
        toast.success('Transcripción completada exitosamente');
        resetRecording(); // Clear recording after successful transcription
      } else {
        throw new Error(response.error || 'Error en la transcripción');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            Grabación de Consulta
          </h3>
          {recordingTime > 0 && (
            <div className="text-sm font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRecording && !hasRecording && (
            <Button
              onClick={startRecording}
              disabled={disabled || isTranscribing}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Iniciar Grabación
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 animate-pulse"
            >
              <Square className="h-4 w-4" />
              Detener Grabación
            </Button>
          )}

          {hasRecording && !isRecording && (
            <>
              <Button
                onClick={playRecording}
                variant="outline"
                disabled={isTranscribing}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pausar' : 'Reproducir'}
              </Button>

              <Button
                onClick={resetRecording}
                variant="outline"
                disabled={isTranscribing}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>

              <Button
                onClick={transcribeAudio}
                disabled={isTranscribing}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isTranscribing ? 'Transcribiendo...' : 'Transcribir'}
              </Button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {isRecording && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Grabando... Habla claramente hacia el micrófono
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Transcribiendo con IA... Por favor espera
            </div>
          </div>
        )}

        {/* Audio Element for Playback */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        {/* Instructions */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <p><strong>💡 Consejos:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Habla claramente y a velocidad normal</li>
            <li>Mantén el micrófono cerca (20-30cm)</li>
            <li>Evita ruidos de fondo</li>
            <li>Máximo 25MB por grabación</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
