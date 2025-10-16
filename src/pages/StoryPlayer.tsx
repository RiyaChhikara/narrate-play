import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { WebcamFeed } from "@/components/WebcamFeed";
import { useToast } from "@/hooks/use-toast";

interface Scene {
  text: string;
  narration: string;
  hasJoinPoint: boolean;
  requiredAction?: string;
}

type StoryState = "passive" | "action" | "success";

const scenes: Scene[] = [
  {
    text: "Once upon a time, in a magical forest filled with sparkling trees and singing birds, there lived a brave little hero.",
    narration: "Once upon a time, in a magical forest filled with sparkling trees and singing birds, there lived a brave little hero.",
    hasJoinPoint: true,
    requiredAction: "wave",
  },
  {
    text: "The hero discovered a mysterious golden path that glowed in the moonlight. With courage in their heart, they decided to follow it.",
    narration: "The hero discovered a mysterious golden path that glowed in the moonlight. With courage in their heart, they decided to follow it.",
    hasJoinPoint: true,
    requiredAction: "point",
  },
  {
    text: "At the end of the path, they found a treasure chest filled with magical crystals. The hero had completed their quest!",
    narration: "At the end of the path, they found a treasure chest filled with magical crystals. The hero had completed their quest!",
    hasJoinPoint: false,
  },
];

const StoryPlayer = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { toast } = useToast();
  const [state, setState] = useState<StoryState>("passive");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [narrationText, setNarrationText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentScene = scenes[sceneIndex];

  useEffect(() => {
    if (currentScene.hasJoinPoint) {
      const timer = setTimeout(() => {
        setState("action");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex, currentScene.hasJoinPoint]);

  const handleGestureDetected = async (gesture: string) => {
    if (gesture === currentScene.requiredAction && state === "action") {
      setState("success");
      
      // Show success toast
      toast({
        title: "🎉 Amazing!",
        description: `Perfect ${gesture}! You're doing great!`,
      });

      // Wait for celebration
      setTimeout(async () => {
        if (sceneIndex < scenes.length - 1) {
          setSceneIndex(sceneIndex + 1);
          setState("passive");
          
          // Generate conversational response
          await generateConversationalResponse(gesture);
        } else {
          toast({
            title: "🌟 Story Complete!",
            description: "You did all the actions! You're a star!",
          });
          setTimeout(() => navigate("/stories"), 2000);
        }
      }, 1500);
    }
  };

  const generateConversationalResponse = async (gesture: string) => {
    // Placeholder for AI integration
    const responses = [
      `Oh wow! I saw you ${gesture}! You're really good at that!`,
      `That was a great ${gesture}! The hero felt so encouraged!`,
      `You did that so fast! Your ${gesture} was perfect!`,
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    setNarrationText(response);
    
    // Future: Call OpenAI/ElevenLabs here
  };

  const getActionEmoji = (action?: string) => {
    const emojiMap: Record<string, string> = {
      wave: "👋",
      point: "☝️",
      clap: "👏",
      jump: "🦘",
      thumbsup: "👍",
    };
    return action ? emojiMap[action] || "✨" : "✨";
  };

  const getStateBadge = () => {
    switch (state) {
      case "passive":
        return "📖 Listening to story...";
      case "action":
        return `✨ Your turn!`;
      case "success":
        return "🎉 Amazing! Well done!";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-200 relative overflow-hidden">
      {/* Floating stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/stories")}
        className="absolute top-6 left-6 bg-black/70 rounded-full p-3 hover:bg-black/90 transition-all duration-200 z-20 backdrop-blur-sm"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 left-20 bg-black/70 rounded-full p-3 hover:bg-black/90 transition-all duration-200 z-20 backdrop-blur-sm"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm px-5 py-3 rounded-full z-20 shadow-lg">
        <span className="text-white font-dm-sans text-sm font-semibold">
          Scene {sceneIndex + 1}/{scenes.length}
        </span>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-2xl z-20 border-4 border-hero-orange">
        <span className="font-fredoka text-xl font-bold text-deep-navy">
          {getStateBadge()}
        </span>
      </div>

      <WebcamFeed 
        isActive={state === "action"} 
        requiredAction={currentScene.requiredAction}
        onGestureDetected={handleGestureDetected}
      />

      {/* Progress dots */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {scenes.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === sceneIndex
                ? 'bg-hero-orange w-8 shadow-lg shadow-hero-orange/50'
                : idx < sceneIndex
                ? 'bg-green-400'
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {state === "action" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-6">
          <div className="bg-white rounded-3xl px-12 py-10 shadow-[0_0_40px_rgba(255,140,66,0.4)] border-4 border-hero-orange text-center animate-scale-in">
            <div className="text-8xl mb-4 animate-bounce">
              {getActionEmoji(currentScene.requiredAction)}
            </div>
            <h2 className="font-fredoka text-4xl font-bold text-deep-navy mb-2">
              {currentScene.requiredAction?.toUpperCase()}
            </h2>
            <p className="font-dm-sans text-lg text-muted-foreground mb-2">
              Try moving your hand!
            </p>
            <p className="font-dm-sans text-sm text-muted-foreground/70">
              The story continues when you do it! ✨
            </p>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-green-500/20 backdrop-blur-sm animate-fade-in">
          <div className="text-center">
            <div className="text-9xl animate-bounce">🎉</div>
            <h2 className="font-fredoka text-5xl font-bold text-white drop-shadow-lg mt-4">
              You did it!
            </h2>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-float"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {['⭐', '✨', '🎉', '🌟'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story text - left side split screen */}
      <div className="absolute bottom-0 left-0 right-0 md:right-auto md:w-1/2 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-10 z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">📖</div>
          <div className="flex-1">
            <p className="text-white font-dm-sans text-2xl leading-relaxed animate-fade-in drop-shadow-lg">
              {narrationText || currentScene.text}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-30 p-6 overflow-y-auto animate-slide-in-right">
          <h2 className="font-fredoka text-2xl font-bold text-deep-navy mb-6">Settings</h2>
          
          <div className="space-y-6">
            {/* Privacy Section */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-fredoka text-lg font-bold text-deep-navy mb-3">🔒 Privacy & Safety</h3>
              <div className="space-y-2 text-sm font-dm-sans">
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  No videos recorded
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  All processing on your device
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  No data sent to cloud
                </p>
              </div>
            </div>

            {/* Learning Goals */}
            <div className="border-l-4 border-hero-orange pl-4">
              <h3 className="font-fredoka text-lg font-bold text-deep-navy mb-3">🎯 Learning Goals</h3>
              <div className="space-y-2">
                {['wave', 'point', 'thumbsup', 'peace'].map((action) => (
                  <label key={action} className="flex items-center gap-2 text-sm font-dm-sans">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="capitalize">{action}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-hero-orange text-white py-3 rounded-lg font-dm-sans font-medium hover:bg-hero-orange/90 transition-colors"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPlayer;
