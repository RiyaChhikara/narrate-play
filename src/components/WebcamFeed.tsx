import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils, FaceLandmarker } from "@mediapipe/tasks-vision";
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { Eye, EyeOff, Mic } from "lucide-react";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface WebcamFeedProps {
  isActive: boolean;
  requiredAction?: string;
  requiredObject?: string;
  enableSpeech?: boolean;
  onGestureDetected: (gesture: string) => void;
  onObjectDetected: (object: string) => void;
}

const GESTURE_MAP: Record<string, string> = {
  "Pointing_Up": "point",
  "Thumb_Up": "thumbsup",
  "Open_Palm": "wave",
  "Closed_Fist": "clap",
  "Victory": "peace",
};

export const WebcamFeed = ({ isActive, requiredAction, requiredObject, enableSpeech, onGestureDetected, onObjectDetected }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const objectDetectorRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(500);
  const isStartingRef = useRef<boolean>(false);
  const manuallyStoppedRef = useRef<boolean>(false);
  const onObjectDetectedRef = useRef<WebcamFeedProps["onObjectDetected"] | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mic state control to avoid rapid start/stop loops
  const isListeningRef = useRef<boolean>(false);
  const lastStartAtRef = useRef<number>(0);
  const cooldownRef = useRef<number>(2000);
  const pausedByVisibilityRef = useRef<boolean>(false);

  // Keep latest callback without retriggering effects
  useEffect(() => {
    onObjectDetectedRef.current = onObjectDetected;
  }, [onObjectDetected]);
  
  const [privacyMode, setPrivacyMode] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string>("");
  const [handDetected, setHandDetected] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState<Array<{ class: string; score: number; bbox: number[] }>>([]);
  const [objectFound, setObjectFound] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [detectedGestureName, setDetectedGestureName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Smile detection tuning constants - manageable thresholds
  const SMILE_MIN = 0.5;  // smile strength required
  const MOUTH_OPEN_MIN = 0.15;  // slight teeth showing
  const HOLD_FRAMES = 5; // require sustained smile for 5 frames (~0.2s at 30fps)
  const smileHoldFramesRef = useRef<number>(0);

  // Initialize speech recognition
  useEffect(() => {
    // Only listen during speech tasks when explicitly enabled (speech mode)
    const speechModeActive = isActive && !requiredAction && enableSpeech;

    // Helper to fully stop and clear timers
    const hardStop = () => {
      manuallyStoppedRef.current = true;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    };

    if (!speechModeActive) {
      hardStop();
      recognitionRef.current = null;
      backoffRef.current = 500;
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.error("Speech recognition not supported");
      return;
    }

    manuallyStoppedRef.current = false;

    // Create a single recognition instance (or reuse)
    const recognition = recognitionRef.current ?? new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const safeRestart = () => {
      if (!speechModeActive || manuallyStoppedRef.current) return;
      if (isStartingRef.current || isListeningRef.current) return;
      const now = Date.now();
      if (now - lastStartAtRef.current < cooldownRef.current) return;
      const delay = backoffRef.current;
      if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = window.setTimeout(() => {
        if (!speechModeActive || manuallyStoppedRef.current || isStartingRef.current || isListeningRef.current) return;
        try {
          isStartingRef.current = true;
          (recognition as any).abort?.(); // ensure clean state when supported
          recognition.start();
        } catch (e) {
          console.error('Failed to (re)start recognition:', e);
        }
      }, delay);
      backoffRef.current = Math.min(backoffRef.current * 1.5, 5000);
    };

    const handleStart = () => {
      console.log("🎤 Speech recognition started");
      isStartingRef.current = false;
      backoffRef.current = 500; // reset backoff on success
      lastStartAtRef.current = Date.now();
      isListeningRef.current = true;
      setIsListening(true);
    };

    const handleResult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const text = lastResult[0].transcript;
      setTranscript(text);
      console.log("🗣️ Heard:", text);
      if (lastResult.isFinal) {
        console.log("✅ Final transcript:", text);
        onObjectDetectedRef.current?.(text.trim());
      }
    };

    const handleError = (event: any) => {
      const err = event?.error;
      // 'aborted' often happens on stop() or duplicate start; ignore and let onend handle
      if (err === 'aborted') {
        return;
      }
      console.error("❌ Speech recognition error:", err);
      if (err === 'not-allowed') {
        console.error("Microphone permission denied!");
        manuallyStoppedRef.current = true;
      } else {
        // Increase backoff a bit on other errors
        backoffRef.current = Math.min(Math.max(backoffRef.current, 1000) * 1.25, 5000);
      }
    };

    const handleEnd = () => {
      console.log("Speech recognition ended");
      isListeningRef.current = false;
      setIsListening(false);
      if (speechModeActive && !manuallyStoppedRef.current && !document.hidden && !pausedByVisibilityRef.current) {
        console.log("Restarting mic with backoff", backoffRef.current, 'ms');
        safeRestart();
      }
    };

    (recognition as any).onstart = handleStart;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    recognitionRef.current = recognition;

    // Request mic permission first, then start
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log("🎤 Microphone permission granted");
        safeRestart();
      })
      .catch((err) => {
        console.error("❌ Microphone permission denied:", err);
        manuallyStoppedRef.current = true;
      });

    // Pause mic when tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        pausedByVisibilityRef.current = true;
        try { recognition.stop(); } catch {}
        isListeningRef.current = false;
        setIsListening(false);
      } else if (speechModeActive) {
        pausedByVisibilityRef.current = false;
        // small delay to avoid flicker when returning to tab
        window.setTimeout(() => safeRestart(), 300);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      hardStop();
      (recognition as any).onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognitionRef.current = null;
    };
  }, [isActive, requiredAction, enableSpeech]);

  // Clear gesture name when requiredAction changes to prevent stale gesture display
  useEffect(() => {
    setDetectedGestureName("");
    setDetectionStatus("");
    setConfidence(0);
  }, [requiredAction]);

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

        // Initialize face landmarker for smile detection
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: true
        });
        
        faceLandmarkerRef.current = faceLandmarker;
        console.log("Face landmarker initialized");

        // Initialize object detector
        const detector = await cocoSsd.load();
        objectDetectorRef.current = detector;
        console.log("Object detector initialized");
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    initModels();

    return () => {
      gestureRecognizerRef.current?.close();
      faceLandmarkerRef.current?.close();
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
      setObjectFound(false);
      setDetectedObjects([]);
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

  // Gesture and object detection loop
  const detectGesturesAndObjects = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const gestureRecognizer = gestureRecognizerRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const objectDetector = objectDetectorRef.current;

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

      // Smile detection (check if required action is "smile")
      if (faceLandmarker && requiredAction === 'smile') {
        const timestamp = performance.now();
        const results = faceLandmarker.detectForVideo(video, timestamp);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          setFaceDetected(true);
          
          // Check for smile using blend shapes
          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            
            // Find smile-related and mouth opening blend shapes
            const mouthSmileLeft = blendshapes.find(b => b.categoryName === 'mouthSmileLeft');
            const mouthSmileRight = blendshapes.find(b => b.categoryName === 'mouthSmileRight');
            const jawOpen = blendshapes.find(b => b.categoryName === 'jawOpen');
            const mouthOpenBlend = blendshapes.find(b => b.categoryName === 'mouthOpen');
            
            if (mouthSmileLeft && mouthSmileRight) {
              const smileScore = (mouthSmileLeft.score + mouthSmileRight.score) / 2;
              const mouthOpen = mouthOpenBlend?.score ?? jawOpen?.score ?? 0;
              
              // Combine into a confidence metric but gate by thresholds
              const combinedScore = smileScore * 0.7 + mouthOpen * 0.3;
              setConfidence(combinedScore);
              
              // Check thresholds and require sustained frames
              if (smileScore > SMILE_MIN && mouthOpen > MOUTH_OPEN_MIN) {
                smileHoldFramesRef.current += 1;
              } else {
                smileHoldFramesRef.current = 0;
              }
              
              if (smileHoldFramesRef.current >= HOLD_FRAMES) {
                setDetectedGestureName('smile');
                setDetectionStatus("correct");
                setShowSuccessAnimation(true);
                setTimeout(() => setShowSuccessAnimation(false), 2000);
                onGestureDetected('smile');
                smileHoldFramesRef.current = 0; // reset after success
              } else {
                setDetectionStatus("incorrect");
              }
            }
          }
        } else {
          setFaceDetected(false);
          setConfidence(0);
        }
      }

      // Gesture detection (for non-smile gestures)
      if (gestureRecognizer && requiredAction && requiredAction !== 'smile') {
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

      // Object detection
      if (objectDetector && requiredObject) {
        const predictions = await objectDetector.detect(video);
        setDetectedObjects(predictions);

        // Draw bounding boxes for detected objects
        predictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          
          // Check if this is the required object
          const isRequired = requiredObject && 
            prediction.class.toLowerCase().includes(requiredObject.toLowerCase());
          
          ctx.strokeStyle = isRequired ? "#00FF00" : "#FFD700";
          ctx.lineWidth = isRequired ? 4 : 2;
          ctx.strokeRect(x, y, width, height);
          
          // Add glow effect for required object
          if (isRequired) {
            ctx.shadowColor = "#00FF00";
            ctx.shadowBlur = 20;
            ctx.strokeRect(x, y, width, height);
            ctx.shadowBlur = 0;
          }

          // Draw label
          ctx.fillStyle = isRequired ? "#00FF00" : "#FFD700";
          ctx.font = "bold 16px Arial";
          const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
          ctx.fillText(text, x, y > 20 ? y - 5 : y + height + 20);

          // Notify if required object is found
          if (isRequired && prediction.score > 0.6 && !objectFound) {
            setObjectFound(true);
            onObjectDetected(prediction.class);
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  if (!isActive) return null;

  // If we're in speech mode (no gesture/object required), show microphone UI
  const isSpeechMode = !requiredAction && !requiredObject;

  return (
    <div className="relative w-full h-full">
      <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 h-full ${
        detectionStatus === 'correct' || isListening ? 'border-8 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.8)]' : 'border-4 border-hero-orange'
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

        {/* Camera/Mic Active Badge */}
        <div className="absolute top-2 right-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-dm-sans font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          {isSpeechMode ? (
            <>
              <Mic className="w-3 h-3" />
              Listening
            </>
          ) : (
            "Camera Active"
          )}
        </div>

        {/* Speech Mode Overlay */}
        {isSpeechMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/40 to-pink-500/40 backdrop-blur-sm">
            <div className="text-center text-white space-y-6 p-8">
              <div className="text-9xl animate-bounce">🎤</div>
              <p className="font-fredoka text-4xl font-bold drop-shadow-lg">
                {isListening ? "I'm listening!" : "Starting microphone..."}
              </p>
              <p className="font-dm-sans text-xl">Speak clearly!</p>
              
              {isListening && (
                <div className="flex gap-3 justify-center mt-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-16 bg-white/90 rounded-full animate-pulse"
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }}
                    />
                  ))}
                </div>
              )}
              
              {transcript && (
                <div className="mt-6 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl">
                  <p className="font-fredoka text-2xl">"{transcript}"</p>
                </div>
              )}
            </div>
          </div>
        )}

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
          {requiredAction === 'smile' ? (
            <>
              <div>Face: <span className="text-yellow-400">{faceDetected ? 'detected' : 'none'}</span></div>
            </>
          ) : requiredAction ? (
            <>
              {handDetected && (
                <div>Hand: <span className="text-yellow-400">detected</span></div>
              )}
            </>
          ) : null}
          {confidence > 0 && (
            <div>Conf: <span className="text-purple-400">{(confidence * 100).toFixed(0)}%</span></div>
          )}
        </div>

        {/* Detection Status */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-3 space-y-1">
          {requiredObject && (
            <div className="text-center mb-2">
              <p className="text-yellow-300 font-dm-sans text-xs font-bold animate-pulse">
                📦 Find: {requiredObject.toUpperCase()}
              </p>
            </div>
          )}
          
          {requiredAction === 'smile' && !faceDetected && (
            <p className="text-white font-dm-sans text-xs text-center animate-pulse">
              Show me your face! 😊
            </p>
          )}
          {requiredAction === 'smile' && faceDetected && detectionStatus === "" && (
            <p className="text-white font-dm-sans text-xs text-center">
              I can see you! Now SMILE! 😄
            </p>
          )}
          {requiredAction === 'smile' && faceDetected && detectionStatus === "incorrect" && (
            <p className="text-yellow-300 font-dm-sans text-xs text-center">
              Bigger smile! Show those teeth! 😁
            </p>
          )}
          {requiredAction === 'smile' && faceDetected && detectionStatus === "correct" && (
            <p className="text-green-300 font-dm-sans text-xs text-center font-bold">
              ✅ Beautiful smile!
            </p>
          )}
          
          {requiredAction && requiredAction !== 'smile' && handDetected && detectionStatus === "" && (
            <p className="text-white font-dm-sans text-xs text-center">
              I can see your hand! 👋
            </p>
          )}
          {requiredAction && requiredAction !== 'smile' && handDetected && detectionStatus === "incorrect" && (
            <p className="text-yellow-300 font-dm-sans text-xs text-center">
              Almost! Try {requiredAction}ing ☝️
            </p>
          )}
          {requiredAction && requiredAction !== 'smile' && handDetected && detectionStatus === "correct" && (
            <p className="text-green-300 font-dm-sans text-xs text-center font-bold">
              ✅ Perfect {requiredAction}!
            </p>
          )}
          
          {/* Detected objects */}
          {detectedObjects.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {detectedObjects.slice(0, 3).map((obj, idx) => (
                <span 
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[10px] font-dm-sans ${
                    requiredObject && obj.class.toLowerCase().includes(requiredObject.toLowerCase())
                      ? 'bg-green-500/80 text-white font-bold animate-pulse'
                      : 'bg-yellow-500/60 text-white'
                  }`}
                >
                  {obj.class}
                </span>
              ))}
            </div>
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
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center" style={{ marginBottom: requiredObject ? '80px' : '60px' }}>
          <p className="text-white/80 font-dm-sans text-[10px]">
            No videos saved. No data sent to cloud.
          </p>
        </div>
      </div>
    </div>
  );
};