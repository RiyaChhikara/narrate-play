import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { Eye, EyeOff } from "lucide-react";

interface WebcamFeedProps {
  isActive: boolean;
  requiredAction?: string;
  onGestureDetected: (gesture: string) => void;
}

const GESTURE_MAP: Record<string, string> = {
  "Pointing_Up": "point",
  "Thumb_Up": "thumbsup",
  "Open_Palm": "wave",
  "Closed_Fist": "clap",
  "Victory": "peace",
};

export const WebcamFeed = ({ isActive, requiredAction, onGestureDetected }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [privacyMode, setPrivacyMode] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string>("");
  const [handDetected, setHandDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);

  // Initialize MediaPipe
  useEffect(() => {
    const initGestureRecognizer = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        gestureRecognizerRef.current = recognizer;
      } catch (error) {
        console.error("Error loading gesture recognizer:", error);
      }
    };

    initGestureRecognizer();

    return () => {
      gestureRecognizerRef.current?.close();
    };
  }, []);

  // Start webcam
  useEffect(() => {
    if (!isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            detectGestures();
          };
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  // Gesture detection loop
  const detectGestures = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const recognizer = gestureRecognizerRef.current;

    if (!video || !canvas || !recognizer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const detect = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const results = recognizer.recognizeForVideo(video, performance.now());
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
          setHandDetected(true);
          
          // Draw hand skeleton
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(
              landmarks,
              GestureRecognizer.HAND_CONNECTIONS,
              { color: "#00FF00", lineWidth: 3 }
            );
            drawingUtils.drawLandmarks(landmarks, {
              color: "#00FF00",
              lineWidth: 1,
              radius: 3
            });
          }
          
          // Check gestures
          if (results.gestures && results.gestures.length > 0) {
            const gesture = results.gestures[0][0];
            const detectedAction = GESTURE_MAP[gesture.categoryName];
            const conf = gesture.score;
            
            setConfidence(conf);
            
            if (detectedAction && conf > 0.7) {
              if (detectedAction === requiredAction) {
                setDetectionStatus("correct");
                onGestureDetected(detectedAction);
              } else {
                setDetectionStatus("incorrect");
              }
            }
          }
        } else {
          setHandDetected(false);
          setDetectionStatus("");
          setConfidence(0);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  if (!isActive) return null;

  return (
    <div className="absolute top-24 right-6 z-20">
      <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isActive ? 'border-4 border-hero-orange animate-pulse' : 'border-4 border-white'
      }`}>
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-64 h-48 object-cover transform scale-x-[-1] ${privacyMode ? 'blur-[20px]' : ''}`}
        />
        
        {/* Canvas overlay for skeleton */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
        />

        {/* Privacy Mode Toggle */}
        <button
          onClick={() => setPrivacyMode(!privacyMode)}
          className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full p-2 hover:bg-black/90 transition-all"
        >
          {privacyMode ? (
            <EyeOff className="w-4 h-4 text-white" />
          ) : (
            <Eye className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Privacy Badge */}
        <div className="absolute top-2 right-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-dm-sans font-bold">
          🔴 NOT RECORDED
        </div>
        <div className="absolute top-9 right-2 text-white/90 text-[10px] font-dm-sans">
          Processing on device only
        </div>

        {/* Detection Status */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2">
          {!handDetected && (
            <p className="text-white font-dm-sans text-xs text-center animate-pulse">
              Show me your hand! 🤚
            </p>
          )}
          {handDetected && detectionStatus === "" && (
            <p className="text-white font-dm-sans text-xs text-center">
              I can see your hand! 👋
            </p>
          )}
          {handDetected && detectionStatus === "incorrect" && (
            <p className="text-yellow-300 font-dm-sans text-xs text-center">
              Almost! Try {requiredAction}ing ☝️
            </p>
          )}
          {handDetected && detectionStatus === "correct" && (
            <p className="text-green-300 font-dm-sans text-xs text-center font-bold">
              ✅ Perfect {requiredAction}!
            </p>
          )}
          
          {/* Confidence meter */}
          {confidence > 0 && (
            <div className="mt-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-hero-orange transition-all duration-200"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Privacy footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center">
          <p className="text-white/80 font-dm-sans text-[10px]">
            No videos saved. No data sent to cloud.
          </p>
        </div>
      </div>
    </div>
  );
};
