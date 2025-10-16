import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
  const [state, setState] = useState<StoryState>("passive");
  const [sceneIndex, setSceneIndex] = useState(0);

  const currentScene = scenes[sceneIndex];

  useEffect(() => {
    if (currentScene.hasJoinPoint) {
      const timer = setTimeout(() => {
        setState("action");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex, currentScene.hasJoinPoint]);

  const handleActionComplete = () => {
    setState("success");
    setTimeout(() => {
      if (sceneIndex < scenes.length - 1) {
        setSceneIndex(sceneIndex + 1);
        setState("passive");
      } else {
        navigate("/stories");
      }
    }, 2000);
  };

  const getStateBadge = () => {
    switch (state) {
      case "passive":
        return "📖 Listening to story...";
      case "action":
        return `✨ Your turn! ${currentScene.requiredAction?.toUpperCase()}`;
      case "success":
        return "🎉 Amazing! Well done!";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-800 relative">
      <button
        onClick={() => navigate("/stories")}
        className="absolute top-6 left-6 bg-black/50 rounded-full p-3 hover:bg-black/70 transition-all duration-200 z-20"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="absolute top-6 right-6 bg-black/60 px-4 py-2 rounded-full z-20">
        <span className="text-white font-dm-sans text-sm">
          Scene {sceneIndex + 1}/{scenes.length}
        </span>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-4 rounded-full shadow-xl z-20">
        <span className="font-fredoka text-xl font-bold text-black">
          {getStateBadge()}
        </span>
      </div>

      {state === "action" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleActionComplete}
            className="bg-hero-orange hover:bg-hero-orange/90 text-white px-12 py-8 rounded-full font-fredoka text-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Tap to Continue
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-10 z-10">
        <p className="text-white font-dm-sans text-2xl leading-relaxed text-center animate-fade-in">
          {currentScene.text}
        </p>
      </div>
    </div>
  );
};

export default StoryPlayer;
