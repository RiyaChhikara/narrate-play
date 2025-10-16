import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings, Loader2 } from "lucide-react";
import { WebcamFeed } from "@/components/WebcamFeed";
import { useToast } from "@/hooks/use-toast";
import { useStoryGeneration, type StoryScene } from "@/hooks/useStoryGeneration";
import { useAudioGeneration } from "@/hooks/useAudioGeneration";
import { Confetti } from "@/components/Confetti";
import { SceneBackground } from "@/components/SceneBackground";
import { ProgressPath } from "@/components/ProgressPath";

type StoryState = "passive" | "action" | "success";

const StoryPlayer = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { toast } = useToast();
  const { generateStory, isLoading: storyLoading } = useStoryGeneration();
  const { generateAudio, playAudioFromBase64, isLoading: audioLoading } = useAudioGeneration();
  
  const [state, setState] = useState<StoryState>("passive");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [narrationText, setNarrationText] = useState("");
  const [gestureDetected, setGestureDetected] = useState(false);
  const [objectDetected, setObjectDetected] = useState(false);
  const [storyScenes, setStoryScenes] = useState<StoryScene[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentScene = storyScenes[sceneIndex];

  // Load settings and generate story on mount
  useEffect(() => {
    const loadStoryData = async () => {
      try {
        // Load settings from localStorage
        const savedWords = localStorage.getItem("words");
        const savedActions = localStorage.getItem("selectedActions");
        
        const targetWords = savedWords ? JSON.parse(savedWords) : ["TREASURE", "CRYSTAL", "FOREST", "RAINBOW"];
        const gestures = savedActions ? JSON.parse(savedActions) : ["wave", "point", "clap"];
        
        console.log('Loading story with:', { targetWords, gestures });
        
        // Generate story
        const story = await generateStory(targetWords, gestures, "our brave hero");
        
        if (story && story.scenes) {
          setStoryScenes(story.scenes);
          console.log('Story loaded with', story.scenes.length, 'scenes');
        } else {
          toast({
            title: "Story Generation Failed",
            description: "Please try again",
            variant: "destructive"
          });
          // Navigate back if story generation fails
          setTimeout(() => navigate("/stories"), 2000);
        }
      } catch (error) {
        console.error('Error loading story:', error);
        toast({
          title: "Error",
          description: "Failed to load story. Please try again.",
          variant: "destructive"
        });
        setTimeout(() => navigate("/stories"), 2000);
      } finally {
        setIsGeneratingStory(false);
      }
    };

    loadStoryData();
  }, []);

  // Play scene narration when scene changes
  useEffect(() => {
    if (!currentScene || isGeneratingStory) return;

    const playSceneNarration = async () => {
      setIsPlayingAudio(true);
      setState("passive");

      try {
        // Play each dialogue line in sequence
        for (const line of currentScene.narration) {
          const audioBase64 = await generateAudio(line.text, line.speaker, line.emotion);
          
          if (audioBase64) {
            setNarrationText(line.text);
            await playAudioFromBase64(audioBase64);
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between lines
          }
        }

        // After narration, show participation prompt
        setState("action");
        setGestureDetected(false);
        setObjectDetected(false);

        // Play participation prompt
        if (currentScene.participation) {
          const promptAudio = await generateAudio(
            currentScene.participation.prompt,
            currentScene.participation.speaker,
            "excited"
          );
          
          if (promptAudio) {
            setNarrationText(currentScene.participation.prompt);
            await playAudioFromBase64(promptAudio);
          }
        }

      } catch (error) {
        console.error('Error playing scene audio:', error);
      } finally {
        setIsPlayingAudio(false);
      }
    };

    playSceneNarration();
  }, [sceneIndex, currentScene, isGeneratingStory]);

  const checkSceneCompletion = () => {
    if (!currentScene?.participation) return false;

    const { type } = currentScene.participation;

    if (type === 'gesture') {
      return gestureDetected;
    } else if (type === 'object') {
      return objectDetected;
    } else if (type === 'choice' || type === 'word') {
      // For choice/word, we'll detect through speech
      return gestureDetected; // Reuse gesture detection for speech
    }
    
    return false;
  };

  useEffect(() => {
    if (state === "action" && checkSceneCompletion()) {
      handleSceneComplete();
    }
  }, [gestureDetected, objectDetected, state]);

  const handleGestureDetected = async (gesture: string) => {
    if (!currentScene?.participation || state !== "action") return;

    const { type } = currentScene.participation;

    // For gesture type, check if detected gesture matches
    if (type === 'gesture') {
      setGestureDetected(true);
      setShowConfetti(true);
      
      toast({
        title: "🎉 Perfect gesture!",
        description: `Great ${gesture}!`,
      });
    }
  };

  const handleObjectDetected = async (object: string) => {
    if (state === "action" && !objectDetected) {
      setObjectDetected(true);
      setShowConfetti(true);
      
      toast({
        title: "✨ Found it!",
        description: `You found the ${object}!`,
      });
    }
  };

  const handleSceneComplete = async () => {
    setState("success");

    toast({
      title: "🌟 Incredible!",
      description: "Perfect! Let's continue the adventure!",
    });

    // Play celebration audio
    const celebrationAudio = await generateAudio(
      "Wonderful! You did it! Let's see what happens next!",
      currentScene.participation.speaker,
      "excited"
    );
    
    if (celebrationAudio) {
      await playAudioFromBase64(celebrationAudio);
    }

    // Wait for celebration animation
    setTimeout(() => {
      if (sceneIndex < storyScenes.length - 1) {
        setSceneIndex(sceneIndex + 1);
        setState("passive");
        setGestureDetected(false);
        setObjectDetected(false);
      } else {
        toast({
          title: "🎊 Story Complete!",
          description: "You completed the magical quest! You're a star!",
        });
        setTimeout(() => navigate("/stories"), 2000);
      }
    }, 2000);
  };

  const generateConversationalResponse = async () => {
    const responses = [
      "Oh wow! You're doing so well! Let's see what happens next!",
      "That was amazing! The story continues...",
      "You're a natural! Ready for the next part?",
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    setNarrationText(response);
    
    // Future: Call AI TTS here
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

  const getObjectEmoji = (object?: string) => {
    const emojiMap: Record<string, string> = {
      book: "📖",
      cup: "☕",
      bottle: "🍼",
      "teddy bear": "🧸",
      apple: "🍎",
      chair: "🪑",
      bed: "🛏️",
      clock: "⏰",
      "cell phone": "📱",
    };
    return object ? (emojiMap[object.toLowerCase()] || "📦") : "📦";
  };

  const getStateBadge = () => {
    if (!currentScene) return "";

    switch (state) {
      case "passive":
        return isPlayingAudio ? "🎭 Story playing..." : "📖 Listening to story...";
      case "action":
        if (!currentScene.participation) return "✨ Your turn!";
        
        const { type } = currentScene.participation;
        if (type === 'gesture') {
          return `✨ Time to participate!`;
        } else if (type === 'object') {
          return `🔍 Find the object!`;
        } else if (type === 'choice') {
          return "💭 Make your choice!";
        } else if (type === 'word') {
          return "🗣️ Say the magic word!";
        }
        return "✨ Your turn!";
      case "success":
        return "🎉 Amazing! Well done!";
      default:
        return "";
    }
  };

  // Show loading state while generating story
  if (isGeneratingStory || storyScenes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-float opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {['☁️', '⭐', '✨', '🌙', '🌟'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        <div className="text-center z-10 px-4">
          <div className="relative mb-8">
            <Loader2 className="w-20 h-20 text-white animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-hero-orange/30 rounded-full animate-pulse" />
            </div>
          </div>
          <h2 className="font-fredoka text-4xl font-bold text-white mb-4 animate-pulse">
            Creating Your Magical Story...
          </h2>
          <p className="font-dm-sans text-xl text-white/90 mb-6">
            Preparing characters and adventures just for you! ✨
          </p>
          <div className="flex gap-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-hero-orange rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated scene background */}
      <SceneBackground sceneNumber={sceneIndex + 1} />

      {/* Confetti effect */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
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
          Scene {sceneIndex + 1}/{storyScenes.length}
        </span>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-2xl z-20 border-4 border-hero-orange max-w-xl">
        <span className="font-fredoka text-lg font-bold text-deep-navy text-center block">
          {getStateBadge()}
        </span>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pt-32 pb-48">
        <div className="flex gap-8 w-full max-w-7xl h-full max-h-[600px]">
          {/* Left side: Story prompt (60%) */}
          {state === "action" && currentScene?.participation && (
            <div className="flex-[0.6] flex items-center justify-center">
              <div className="bg-white rounded-3xl px-12 py-10 shadow-[0_0_60px_rgba(255,140,66,0.6)] border-4 border-hero-orange text-center animate-[slide-in-bottom_0.5s_ease-out] max-w-2xl relative">
                {/* Glowing border animation */}
                <div className="absolute inset-0 rounded-3xl border-4 border-hero-orange animate-pulse opacity-50" />
                
                {/* Pulsing outer glow */}
                <div className="absolute inset-0 rounded-3xl bg-hero-orange/20 animate-ping" style={{ animationDuration: '2s' }} />
                
                {currentScene.participation.type === 'object' ? (
                  <div className="relative z-10">
                    <div className="text-8xl mb-4 animate-bounce">📦</div>
                    <h2 className="font-fredoka text-4xl font-bold text-deep-navy mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-lg text-muted-foreground mb-2">
                      Look around your room!
                    </p>
                    <p className="font-dm-sans text-sm text-muted-foreground/70">
                      Show it to the camera! 📹✨
                    </p>
                  </div>
                ) : currentScene.participation.type === 'gesture' ? (
                  <div className="relative z-10">
                    <div className="text-8xl mb-4 animate-[bounce_1s_ease-in-out_infinite]">✨</div>
                    <h2 className="font-fredoka text-4xl font-bold text-deep-navy mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-lg text-muted-foreground mb-2">
                      Show me your move!
                    </p>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="text-8xl mb-4 animate-pulse">💭</div>
                    <h2 className="font-fredoka text-3xl font-bold text-deep-navy mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-lg text-muted-foreground">
                      {currentScene.participation.type === 'word' 
                        ? 'Say it out loud!'
                        : 'Make your choice!'}
                    </p>
                    {currentScene.participation.expectedResponses && (
                      <div className="flex gap-3 justify-center mt-4">
                        {currentScene.participation.expectedResponses.map((option) => (
                          <div key={option} className="px-4 py-2 bg-hero-orange/20 rounded-lg border-2 border-hero-orange">
                            <span className="font-fredoka text-lg">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Right side: Large webcam feed (40%) */}
          <div className="flex-[0.4] min-h-[400px]">
            <WebcamFeed 
              isActive={state === "action"} 
              requiredAction={currentScene?.participation?.type === 'gesture' ? currentScene.participation.expectedResponses?.[0] : undefined}
              requiredObject={currentScene?.participation?.type === 'object' ? currentScene.participation.expectedResponses?.[0] : undefined}
              onGestureDetected={handleGestureDetected}
              onObjectDetected={handleObjectDetected}
            />
          </div>
        </div>
      </div>

      {/* Progress path with icons */}
      <ProgressPath currentScene={sceneIndex + 1} totalScenes={storyScenes.length} />

      {state === "success" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-green-400/30 via-blue-400/30 to-purple-400/30 backdrop-blur-md animate-fade-in">
          <div className="text-center relative">
            <div className="text-9xl animate-[bounce_0.6s_ease-in-out_infinite]">🎉</div>
            <h2 className="font-fredoka text-6xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mt-4 animate-pulse">
              Amazing!
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

      {/* Story text with speaker indicator */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-10 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-4xl">
              {isPlayingAudio ? "🎭" : "📖"}
            </div>
            <div className="flex-1">
              <p className="text-white font-dm-sans text-2xl leading-relaxed animate-fade-in drop-shadow-lg">
                {narrationText || (currentScene ? "Listen to the story..." : "")}
              </p>
              {isPlayingAudio && (
                <div className="mt-3 flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-6 bg-hero-orange rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
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

            {/* What We Detect */}
            <div className="border-l-4 border-hero-orange pl-4">
              <h3 className="font-fredoka text-lg font-bold text-deep-navy mb-3">🎯 What We Detect</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-dm-sans text-sm font-semibold mb-1">Gestures:</p>
                  <div className="flex flex-wrap gap-1">
                    {['wave', 'point', 'thumbsup', 'peace', 'clap'].map((action) => (
                      <span key={action} className="text-xs bg-purple-100 px-2 py-1 rounded">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-dm-sans text-sm font-semibold mb-1">Objects:</p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {['book', 'cup', 'teddy bear', 'apple', 'chair', 'cell phone'].map((obj) => (
                      <span key={obj} className="bg-yellow-100 px-2 py-1 rounded">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
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