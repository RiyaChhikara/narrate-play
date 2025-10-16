import { useEffect, useRef } from "react";

interface WebcamFeedProps {
  isActive: boolean;
}

export const WebcamFeed = ({ isActive }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Stop webcam when not active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    // Start webcam
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute top-24 right-6 z-20 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-64 h-48 object-cover transform scale-x-[-1]"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1">
        <p className="text-white font-dm-sans text-xs text-center">📹 Action Detection Active</p>
      </div>
    </div>
  );
};
