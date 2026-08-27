import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    // Start Camera Stream
    const startCamera = async () => {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(
          'Tidak dapat mengakses kamera. Pastikan izin kamera telah diizinkan pada browser Anda.'
        );
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      setTimeout(() => {
        setIsCapturing(false);
        onCapture(dataUrl);
        onClose();
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Pemindai Kamera LJK Realtime
              </h3>
              <p className="text-xs text-slate-400">
                Posisikan lembar LJK di dalam kotak panduan hijau
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport with Document Scanner Guide */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 flex flex-col items-center gap-2 text-xs">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Document Alignment Frame */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-cyan-400/70 rounded-xl pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Laser scan line animation in camera */}
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00f0ff] animate-bounce top-1/2 -translate-y-1/2" />
              </div>

              {/* Flash effect on capture */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white animate-out fade-out duration-300 z-30" />
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 font-mono">
            Tips: Pastikan pencahayaan cukup dan kertas rata
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>

            <button
              onClick={handleSnap}
              disabled={!!cameraError}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/50 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto LJK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
