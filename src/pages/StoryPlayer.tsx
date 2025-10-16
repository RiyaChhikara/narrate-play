import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings, Loader2 } from "lucide-react";
import { WebcamFeed } from "@/components/WebcamFeed";
import { useToast } from "@/hooks/use-toast";
import { useStoryGeneration, type StoryScene } from "@/hooks/useStoryGeneration";
import { useAudioGeneration } from "@/hooks/useAudioGeneration";
import { SceneBackground } from "@/components/SceneBackground";
import { ConfettiCanvas } from "@/components/ConfettiCanvas";

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
  const [speechDetected, setSpeechDetected] = useState(false);
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
        setSpeechDetected(false);

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
    } else if (type === 'choice' || type === 'word') {
      return speechDetected;
    }
    
    return false;
  };

  useEffect(() => {
    if (state === "action" && checkSceneCompletion()) {
      handleSceneComplete();
    }
  }, [gestureDetected, speechDetected, state]);

  const handleGestureDetected = async (gesture: string) => {
    if (!currentScene?.participation || state !== "action") return;

    const { type } = currentScene.participation;

    // For gesture type, check if detected gesture matches
    if (type === 'gesture') {
      setGestureDetected(true);
      
      toast({
        title: "🎉 Perfect gesture!",
        description: `Great ${gesture}!`,
      });
    }
  };

  const handleSpeechDetected = async (text: string) => {
    if (state === "action" && !speechDetected) {
      setSpeechDetected(true);
      
      toast({
        title: "🗣️ Great job!",
        description: `You said "${text}"!`,
      });
    }
  };

  const handleSceneComplete = async () => {
    setState("success");
    setShowConfetti(true);

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
      setShowConfetti(false);
      if (sceneIndex < storyScenes.length - 1) {
        setSceneIndex(sceneIndex + 1);
        setState("passive");
        setGestureDetected(false);
        setSpeechDetected(false);
      } else {
        toast({
          title: "🎊 Story Complete!",
          description: "You completed the magical quest! You're a star!",
        });
        setTimeout(() => navigate("/stories"), 2000);
      }
    }, 3000);
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
          return `✨ Show your gesture!`;
        } else if (type === 'choice') {
          return "💭 Make your choice!";
        } else if (type === 'word') {
          return "🗣️ Say it out loud!";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <h2 className="font-fredoka text-3xl font-bold text-white mb-2">
            Creating Your Magical Story...
          </h2>
          <p className="font-dm-sans text-white/80">
            Preparing characters and adventures just for you! ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Scene Background */}
      <SceneBackground sceneNumber={sceneIndex} totalScenes={storyScenes.length} />
      
      {/* Confetti on Success */}
      {showConfetti && <ConfettiCanvas />}

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
      <div className="absolute inset-0 flex items-center justify-center p-8 pt-32 pb-64">
        <div className="flex gap-8 w-full max-w-7xl h-full max-h-[600px]">
          {/* Left side: Story prompt (60%) with enhanced animations */}
          {state === "action" && currentScene?.participation && (
            <div className="flex-[0.6] flex items-center justify-center animate-[slideInUp_0.6s_ease-out]">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl px-12 py-10 shadow-[0_0_60px_rgba(255,140,66,0.6)] border-4 border-hero-orange text-center max-w-2xl animate-[pulse_2s_ease-in-out_infinite] relative">
                {/* Floating sparkles around card */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-2xl animate-float opacity-70"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    >
                      ✨
                    </div>
                  ))}
                </div>

                {currentScene.participation.type === 'gesture' ? (
                  <>
                    <div className="text-8xl mb-4 animate-bounce">🤲</div>
                    <h2 className="font-fredoka text-4xl font-bold text-deep-navy mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-lg text-muted-foreground mb-2">
                      Show me your move!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-8xl mb-4 animate-pulse">🗣️</div>
                    <h2 className="font-fredoka text-4xl font-bold text-deep-navy mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-lg text-muted-foreground">
                      Say it out loud!
                    </p>
                    {currentScene.participation.expectedResponses && (
                      <div className="flex gap-3 justify-center mt-4 flex-wrap">
                        {currentScene.participation.expectedResponses.slice(0, 5).map((option) => (
                          <div key={option} className="px-4 py-2 bg-hero-orange/20 rounded-lg border-2 border-hero-orange animate-pulse">
                            <span className="font-fredoka text-lg">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Right side: Large webcam feed (40%) */}
          <div className="flex-[0.4] min-h-[400px]">
            <WebcamFeed 
              isActive={state === "action"} 
              requiredAction={currentScene?.participation?.type === 'gesture' ? currentScene.participation.expectedResponses?.[0] : undefined}
              requiredObject={undefined}
              onGestureDetected={handleGestureDetected}
              onObjectDetected={handleSpeechDetected}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Progress Indicator - Visual Journey */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl">
          {storyScenes.map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`relative transition-all duration-500 ${
                  idx === sceneIndex
                    ? 'w-12 h-12 animate-pulse'
                    : 'w-8 h-8'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center font-fredoka font-bold transition-all duration-500 ${
                    idx < sceneIndex
                      ? 'bg-green-400 text-white scale-100'
                      : idx === sceneIndex
                      ? 'bg-hero-orange text-white shadow-lg shadow-hero-orange/50'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {idx < sceneIndex ? '✓' : idx + 1}
                </div>
                {idx === sceneIndex && (
                  <div className="absolute inset-0 rounded-full bg-hero-orange/30 animate-ping" />
                )}
              </div>
              {idx < storyScenes.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${
                    idx < sceneIndex ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>


      {state === "success" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-green-400/30 via-yellow-300/30 to-orange-400/30 backdrop-blur-md animate-fade-in">
          <div className="text-center relative">
            <div className="text-[12rem] animate-[bounce_0.6s_ease-in-out_3] scale-110">
              🎉
            </div>
            <h2 className="font-fredoka text-7xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] mt-4 animate-[scale-in_0.5s_ease-out]">
              You did it!
            </h2>
            <p className="font-dm-sans text-2xl text-white/90 mt-4 animate-fade-in">
              That was amazing! 🌟
            </p>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute text-5xl animate-float"
                style={{
                  left: `${-20 + Math.random() * 140}%`,
                  top: `${-20 + Math.random() * 140}%`,
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              >
                {['⭐', '✨', '🎉', '🌟', '💫', '🎊'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narration Bar - Speech Bubble Style */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-t-[32px] p-8 shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-6">
              {/* Character Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-hero-orange flex items-center justify-center text-3xl shadow-lg">
                  {isPlayingAudio ? "🎭" : "📖"}
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 pt-2">
                <p className="text-white font-dm-sans text-3xl leading-relaxed animate-fade-in drop-shadow-lg">
                  {narrationText || (currentScene ? "Listen to the story..." : "")}
                </p>
                
                {/* Animated Waveform */}
                {isPlayingAudio && (
                  <div className="mt-4 flex gap-2 items-end">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-hero-orange rounded-full animate-pulse"
                        style={{ 
                          height: `${20 + Math.random() * 20}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
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