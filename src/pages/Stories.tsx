import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  magicWord: string;
  thumbnail: string;
}

const mainStory: Story = {
  id: "enchanted-forest",
  title: "The Enchanted Forest",
  duration: "5 min",
  difficulty: "easy",
  magicWord: "Adventure",
  thumbnail: "/placeholder.svg",
};

const Stories = () => {
  const navigate = useNavigate();
  const { generateStory, isLoading } = useStoryGeneration();

  const handleGenerateStory = async () => {
    try {
      // Get ALL settings from localStorage
      const selectedLanguages = JSON.parse(localStorage.getItem("selectedLanguages") || '["en"]');
      const magicWords = JSON.parse(localStorage.getItem("words") || '["TREASURE", "CRYSTAL", "RAINBOW"]');
      const selectedActions = JSON.parse(localStorage.getItem("selectedActions") || '["wave", "point", "clap"]');
      
      console.log('Story settings:', { selectedLanguages, magicWords, selectedActions });
      
      toast.loading("Creating your personalized story with your magic words and actions...");
      
      const story = await generateStory(magicWords, selectedActions, "Hero", false, selectedLanguages);
      
      if (story) {
        toast.success("Story created! 🎉");
        navigate("/story/generated", { state: { story } });
      }
    } catch (error) {
      toast.error("Failed to create story. Please try again.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 pb-24">
      <div className="container mx-auto px-4 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-fredoka text-4xl font-bold text-off-white">Your Stories</h1>
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Main Story Card - Large and Inviting */}
          <Card
            onClick={() => navigate(`/story/${mainStory.id}`)}
            className="bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-hero-orange hover:scale-[1.02] transform"
          >
            <CardHeader className="pb-4">
              <div 
                className="w-full h-64 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 relative overflow-hidden"
                style={{
                  backgroundImage: 'url(https://source.unsplash.com/1200x800/?magical-forest,fantasy,enchanted)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-6">
                  <h2 className="font-fredoka text-4xl font-bold text-white drop-shadow-lg">
                    {mainStory.title}
                  </h2>
                </div>
                <div className="absolute top-4 right-4 bg-hero-orange/90 backdrop-blur-sm rounded-full px-4 py-2">
                  <p className="font-fredoka text-lg font-bold text-white">
                    ✨ Start Adventure
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <p className="font-dm-sans text-lg text-gray-700 leading-relaxed">
                Join a magical journey through an enchanted forest! Meet friendly creatures, discover hidden treasures, and practice your words with gestures and speech. 🌳✨
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge
                  variant="outline"
                  className={`${getDifficultyColor(mainStory.difficulty)} border-2 font-dm-sans text-base px-4 py-2`}
                >
                  <Star className="w-5 h-5 mr-2" />
                  {mainStory.difficulty.charAt(0).toUpperCase() + mainStory.difficulty.slice(1)}
                </Badge>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="font-dm-sans text-base">{mainStory.duration}</span>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                <p className="font-fredoka text-2xl font-bold text-purple-700 mb-2">
                  🎭 Your Role: The Brave Explorer
                </p>
                <p className="font-dm-sans text-base text-purple-600">
                  Use your voice, gestures, and movements to guide the story!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generate Custom Story Option */}
          <div className="text-center">
            <p className="font-dm-sans text-white/80 mb-4">Want a personalized story?</p>
            <Button
              onClick={handleGenerateStory}
              disabled={isLoading}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-fredoka text-lg py-6 px-8 rounded-2xl border-2 border-white/40"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isLoading ? "Creating Magic..." : "Generate Custom Story"}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Stories;
