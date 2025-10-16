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

const stories: Story[] = [
  {
    id: "forest-adventure",
    title: "The Enchanted Forest",
    duration: "5 min",
    difficulty: "easy",
    magicWord: "Adventure",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "treasure-hunt",
    title: "The Golden Treasure",
    duration: "7 min",
    difficulty: "medium",
    magicWord: "Treasure",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "dragon-castle",
    title: "The Brave Dragon Knight",
    duration: "8 min",
    difficulty: "hard",
    magicWord: "Dragon",
    thumbnail: "/placeholder.svg",
  },
];

const Stories = () => {
  const navigate = useNavigate();
  const { generateStory, isLoading } = useStoryGeneration();

  const handleGenerateStory = async () => {
    try {
      // Get settings from localStorage
      const selectedLanguages = JSON.parse(localStorage.getItem("selectedLanguages") || '["en"]');
      const words = JSON.parse(localStorage.getItem("words") || '["TREASURE", "CRYSTAL"]');
      const actions = JSON.parse(localStorage.getItem("selectedActions") || '["wave", "point"]');
      
      toast.loading("Creating your magical story...");
      
      const story = await generateStory(words, actions, "Hero", false, selectedLanguages);
      
      if (story) {
        toast.success("Story created! 🎉");
        // Navigate to story player with generated story
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

        <div className="mb-8 w-full max-w-2xl mx-auto">
          <Button
            onClick={handleGenerateStory}
            disabled={isLoading}
            className="w-full bg-hero-orange hover:bg-hero-orange/90 text-white font-fredoka text-xl py-6 rounded-2xl shadow-lg"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            {isLoading ? "Creating Magic..." : "Generate New Story"}
          </Button>
        </div>

        <div className="space-y-8">
          {stories.map((story) => (
            <div key={story.id} className="w-full max-w-2xl mx-auto">
              <div className="bg-hero-orange/90 rounded-2xl px-6 py-4 mb-4 text-center shadow-lg">
                <p className="font-fredoka text-xl font-bold text-white">
                  Say the magic word: "{story.magicWord}" ✨
                </p>
              </div>

              <Card
                onClick={() => navigate(`/story/${story.id}`)}
                className="bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-transparent hover:border-hero-orange"
              >
                <CardHeader className="pb-4">
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <h2 className="font-fredoka text-2xl font-bold text-deep-navy">
                    {story.title}
                  </h2>

                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`${getDifficultyColor(story.difficulty)} border-2 font-dm-sans text-sm px-3 py-1`}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {story.difficulty.charAt(0).toUpperCase() + story.difficulty.slice(1)}
                    </Badge>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="font-dm-sans text-sm">{story.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Stories;
