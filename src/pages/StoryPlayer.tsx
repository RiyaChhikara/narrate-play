import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Settings, Loader2 } from "lucide-react";
import { WebcamFeed } from "@/components/WebcamFeed";
import { useToast } from "@/hooks/use-toast";
import { useStoryGeneration, type StoryScene } from "@/hooks/useStoryGeneration";
import { useAudioGeneration } from "@/hooks/useAudioGeneration";
import { SceneBackground } from "@/components/SceneBackground";

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
  const [canListen, setCanListen] = useState(false);
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
        const gestures = savedActions ? JSON.parse(savedActions) : ["wave", "point", "thumbsup"];
        
        console.log('Loading story with:', { targetWords, gestures });
        
        // Generate story (will use demo fallback immediately)
        const story = await generateStory(targetWords, gestures, "our brave hero");
        
        if (story && story.scenes) {
          setStoryScenes(story.scenes);
          console.log('Story loaded with', story.scenes.length, 'scenes');
          setIsGeneratingStory(false); // Remove loading state immediately
        } else {
          toast({
            title: "Story Generation Failed",
            description: "Please try again",
            variant: "destructive"
          });
          setTimeout(() => navigate("/stories"), 1000);
        }
      } catch (error) {
        console.error('Error loading story:', error);
        toast({
          title: "Error",
          description: "Failed to load story. Please try again.",
          variant: "destructive"
        });
        setTimeout(() => navigate("/stories"), 1000);
      }
    };

    loadStoryData();
  }, []);

  // Play scene narration when scene changes
  useEffect(() => {
    if (!currentScene || isGeneratingStory || isPlayingAudio) return;

    const playSceneNarration = async () => {
      setIsPlayingAudio(true);
      setState("passive");
      setGestureDetected(false);
      setSpeechDetected(false);
      setCanListen(false);

      try {
        console.log(`Playing scene ${sceneIndex + 1} narration`);
        
        // Play each dialogue line in sequence
        for (const line of currentScene.narration) {
          console.log(`Playing line: "${line.text}"`);
          const audioBase64 = await generateAudio(line.text, line.speaker, line.emotion);
          
          if (audioBase64) {
            setNarrationText(line.text);
            await playAudioFromBase64(audioBase64);
            await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause between lines
          }
        }

        console.log('Narration complete, checking participation');
        
        // After narration, show participation prompt
        if (currentScene.participation) {
          setState("action");
          
          const type = currentScene.participation.type;
          
          // For speech-based participation, start listening immediately
          if (type === 'word' || type === 'choice') {
            setCanListen(true);
            console.log('🎤 Speech listening activated');
          }
          
          // Play participation prompt
          console.log(`Playing prompt: "${currentScene.participation.prompt}"`);
          const promptAudio = await generateAudio(
            currentScene.participation.prompt,
            currentScene.participation.speaker,
            "excited"
          );
          
          if (promptAudio) {
            setNarrationText(currentScene.participation.prompt);
            await playAudioFromBase64(promptAudio);
          }
          
          console.log('Now waiting for user response...');
        }

      } catch (error) {
        console.error('Error playing scene audio:', error);
      } finally {
        setIsPlayingAudio(false);
      }
    };

    playSceneNarration();
  }, [sceneIndex, currentScene?.sceneNumber]); // Only trigger on scene change

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

  // Check for scene completion
  useEffect(() => {
    if (state !== "action") return;
    
    const isComplete = checkSceneCompletion();
    console.log('Checking completion:', { state, gestureDetected, speechDetected, isComplete });
    
    if (isComplete) {
      handleSceneComplete();
    }
  }, [gestureDetected, speechDetected, state]);

  const handleGestureDetected = async (gesture: string) => {
    if (!currentScene?.participation || state !== "action") return;

    const { type } = currentScene.participation;

    // For gesture type, check if detected gesture matches
    if (type === 'gesture') {
      setGestureDetected(true);
      console.log('✅ Gesture detected and accepted');
    }
  };

  const handleSpeechDetected = async (text: string) => {
    console.log('Speech detected:', { text, state, speechDetected });
    
    if (state === "action" && !speechDetected) {
      setSpeechDetected(true);
      console.log(`✅ Speech accepted: "${text}"`);
    }
  };

  const handleSceneComplete = async () => {
    console.log('Scene complete! Moving to success state');
    setState("success");

    // Quick transition
    setTimeout(() => {
      console.log('Moving to next scene or ending story');
      
      if (sceneIndex < storyScenes.length - 1) {
        console.log(`Advancing to scene ${sceneIndex + 2}`);
        setSceneIndex(sceneIndex + 1);
        setState("passive");
        setGestureDetected(false);
        setSpeechDetected(false);
      } else {
        console.log('Story complete!');
        setTimeout(() => navigate("/stories"), 1000);
      }
    }, 500);
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
      smile: "😊",
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
        return "✓ Well done";
      default:
        return "";
    }
  };

  // Show minimal loading state
  if (isGeneratingStory || storyScenes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">✨</div>
          <h2 className="font-fredoka text-2xl font-bold text-white">
            Starting your adventure...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Scene Background */}
      <SceneBackground sceneNumber={sceneIndex} totalScenes={storyScenes.length} />
      
      {/* Confetti removed - too stimulating */}

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

      {/* Main Content Area - Responsive Layout */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 md:pt-32 pb-72 sm:pb-80 md:pb-96">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl h-full max-h-[600px]">
          {/* Participation Prompt - Responsive */}
          {state === "action" && currentScene?.participation && (
            <div className="flex-1 lg:flex-[0.6] flex items-center justify-center animate-fade-in">
              <div className="bg-deep-navy/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-6 sm:px-10 md:px-12 py-6 sm:py-8 md:py-10 shadow-xl border border-white/20 text-center max-w-2xl transition-all duration-300 text-white">
                {currentScene.participation.type === 'gesture' ? (
                  <>
                    <div className="text-6xl sm:text-7xl md:text-8xl mb-4">
                      {getActionEmoji(currentScene.participation.expectedResponses?.[0])}
                    </div>
                    <h2 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-base sm:text-lg text-white/50 mb-2">
                      Show me your move
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl sm:text-7xl md:text-8xl mb-4">🗣️</div>
                    <h2 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                      {currentScene.participation.prompt}
                    </h2>
                    <p className="font-dm-sans text-base sm:text-lg text-white/50">
                      Say it out loud
                    </p>
                    {currentScene.participation.expectedResponses && (
                      <div className="flex gap-2 sm:gap-3 justify-center mt-3 sm:mt-4 flex-wrap">
                        {currentScene.participation.expectedResponses.slice(0, 5).map((option) => (
                          <div key={option} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-lg border border-white/20">
                            <span className="font-fredoka text-base sm:text-lg text-white">
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Webcam Feed - Responsive */}
          <div className="flex-1 lg:flex-[0.4] min-h-[300px] sm:min-h-[400px]">
            <WebcamFeed 
              isActive={state === "action"} 
              requiredAction={currentScene?.participation?.type === 'gesture' ? currentScene.participation.expectedResponses?.[0] : undefined}
              requiredObject={undefined}
              enableSpeech={canListen}
              onGestureDetected={handleGestureDetected}
              onObjectDetected={handleSpeechDetected}
            />
          </div>
        </div>
      </div>

      {/* Vertical Progress Indicator - Left Side */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="flex flex-col items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-6 rounded-full shadow-2xl">
          {storyScenes.map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
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
                      : 'bg-white/30 text-white/60'
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
                  className={`w-1 h-10 my-2 rounded-full transition-all duration-500 ${
                    idx < sceneIndex ? 'bg-green-400' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>


      {state === "success" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm bg-background/20 animate-fade-in">
          <div className="text-center bg-white/95 backdrop-blur-xl rounded-3xl px-12 py-8 shadow-xl border border-border animate-scale-in">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="font-fredoka text-3xl font-bold text-foreground">
              Perfect!
            </h2>
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