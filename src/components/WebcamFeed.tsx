import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { Eye, EyeOff } from "lucide-react";

interface WebcamFeedProps {
  isActive: boolean;
  requiredAction?: string;
  onGestureDetected: (gesture: string) => void;
  onSpeechDetected: (text: string) => void;
}

const GESTURE_MAP: Record<string, string> = {
  "Pointing_Up": "point",
  "Thumb_Up": "thumbsup",
  "Open_Palm": "wave",
  "Closed_Fist": "clap",
  "Victory": "peace",
};

export const WebcamFeed = ({ isActive, requiredAction, onGestureDetected, onSpeechDetected }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const [privacyMode, setPrivacyMode] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string>("");
  const [handDetected, setHandDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [detectedGestureName, setDetectedGestureName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Initialize MediaPipe and Speech Recognition
  useEffect(() => {
    const initModels = async () => {
      try {
        // Initialize gesture recognizer
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
        console.log("Gesture recognizer initialized");

        // Initialize speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
            
            if (event.results[current].isFinal) {
              console.log('Speech detected:', transcriptText);
              onSpeechDetected(transcriptText);
              setIsListening(false);
            }
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };

          recognitionRef.current = recognition;
          console.log("Speech recognition initialized");
        }
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    initModels();

    return () => {
      gestureRecognizerRef.current?.close();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSpeechDetected]);

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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
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
            detectGesturesAndObjects();
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

  // Start speech recognition when not detecting gestures
  useEffect(() => {
    if (isActive && !requiredAction && recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('Speech recognition started');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [isActive, requiredAction, isListening]);

  // Gesture detection loop
  const detectGesturesAndObjects = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const gestureRecognizer = gestureRecognizerRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const detect = async () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gesture detection
      if (gestureRecognizer && requiredAction) {
        const timestamp = performance.now();
        const results = gestureRecognizer.recognizeForVideo(video, timestamp);

        if (results.landmarks && results.landmarks.length > 0) {
          setHandDetected(true);
          
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(
              landmarks,
              GestureRecognizer.HAND_CONNECTIONS,
              { color: "#00FF00", lineWidth: 3 }
            );
            drawingUtils.drawLandmarks(landmarks, {
              color: "#FF0000",
              lineWidth: 1,
              radius: 3,
            });
          }

          if (results.gestures && results.gestures.length > 0) {
            const gesture = results.gestures[0][0];
            const recognizedGesture = GESTURE_MAP[gesture.categoryName];
            const conf = gesture.score;

            setConfidence(conf);

            if (recognizedGesture && conf > 0.7) {
              setDetectedGestureName(recognizedGesture);
              if (requiredAction && recognizedGesture === requiredAction) {
                setDetectionStatus("correct");
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 2000);
                onGestureDetected(recognizedGesture);
              } else {
                setDetectionStatus("incorrect");
              }
            }
          }
        } else {
          setHandDetected(false);
          setConfidence(0);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  if (!isActive) return null;

  return (
    <div className="relative w-full h-full">
      <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 h-full ${
        detectionStatus === 'correct' ? 'border-8 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.8)]' : 'border-4 border-hero-orange'
      }`}>
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform scale-x-[-1] ${privacyMode ? 'blur-[20px]' : ''}`}
        />
        
        {/* Canvas overlay for skeleton and objects */}
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

        {/* Camera Active Badge */}
        <div className="absolute top-2 right-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-dm-sans font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Camera Active
        </div>

        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 bg-green-500/30 backdrop-blur-sm flex items-center justify-center animate-scale-in z-20">
            <div className="text-center">
              <div className="text-9xl animate-bounce mb-4">✓</div>
              <p className="text-white font-fredoka text-4xl font-bold drop-shadow-lg animate-pulse">
                {detectedGestureName.toUpperCase()} detected!
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="text-4xl animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ✨
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Debug Overlay */}
        <div className="absolute top-12 left-2 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono">
          <div>Status: <span className="text-green-400">{detectionStatus || 'waiting'}</span></div>
          <div>Hand: <span className="text-yellow-400">{handDetected ? 'detected' : 'none'}</span></div>
          {detectedGestureName && (
            <div>Gesture: <span className="text-blue-400">{detectedGestureName}</span></div>
          )}
          {confidence > 0 && (
            <div>Conf: <span className="text-purple-400">{(confidence * 100).toFixed(0)}%</span></div>
          )}
        </div>

        {/* Detection Status */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-3 space-y-1">
          {/* Speech Recognition Status */}
          {isListening && (
            <div className="text-center mb-2">
              <p className="text-blue-300 font-dm-sans text-xs font-bold animate-pulse">
                🎤 Listening... {transcript && `"${transcript}"`}
              </p>
            </div>
          )}
          
          {requiredAction && !handDetected && (
            <p className="text-white font-dm-sans text-xs text-center animate-pulse">
              Show me your hand! 🤚
            </p>
          )}
          {requiredAction && handDetected && detectionStatus === "" && (
            <p className="text-white font-dm-sans text-xs text-center">
              I can see your hand! 👋
            </p>
          )}
          {requiredAction && handDetected && detectionStatus === "incorrect" && (
            <p className="text-yellow-300 font-dm-sans text-xs text-center">
              Almost! Try {requiredAction}ing ☝️
            </p>
          )}
          {requiredAction && handDetected && detectionStatus === "correct" && (
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
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center" style={{ marginBottom: '60px' }}>
          <p className="text-white/80 font-dm-sans text-[10px]">
            No videos saved. No data sent to cloud.
          </p>
        </div>
      </div>
    </div>
  );
};