"use client";

import React, { useRef, useEffect, useState } from "react";
import { Camera, CameraOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraViewProps {
  onFrame: (dataUri: string) => void;
  isProcessing: boolean;
  isAiEnabled: boolean;
  isRateLimited?: boolean;
}

export function CameraView({ onFrame, isProcessing, isAiEnabled, isRateLimited }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera permission denied. Please enable camera access.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    // Increased interval to 15 seconds to stay under free tier RPM limits (4 requests per minute)
    if (isStreaming && isAiEnabled && !isProcessing && !isRateLimited) {
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL("image/jpeg", 0.7);
            onFrame(dataUri);
          }
        }
      }, 15000); 
    }
    return () => clearInterval(interval);
  }, [isStreaming, isAiEnabled, isProcessing, isRateLimited, onFrame]);

  return (
    <div className="viewfinder-container">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <CameraOff className="w-16 h-16 text-destructive" />
          <p className="text-xl font-bold">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="scan-line" />
          
          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-primary/20">
            <div className={cn("pulsing-dot", (!isStreaming || !isAiEnabled || isRateLimited) && "bg-muted animate-none")} />
            <span className="text-sm font-medium tracking-wider">
              {isRateLimited ? "QUOTA EXCEEDED" : (isStreaming ? (isAiEnabled ? "LIVE SCAN" : "CAMERA ONLY") : "CONNECTING...")}
            </span>
          </div>

          {isProcessing && (
            <div className="absolute top-6 right-6 p-2 bg-primary/20 rounded-full backdrop-blur-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {isRateLimited && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
              <AlertCircle className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">AI Limit Reached</h3>
              <p className="text-sm text-foreground/80 max-w-xs">
                You've hit the free tier limit. Scanning is paused for 60 seconds. Enable billing in AI Studio for real-time speed.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
