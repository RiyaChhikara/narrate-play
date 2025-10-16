import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Stories = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 pb-24">
      <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-off-white tracking-wide">Your Story Adventure</h1>
        </div>

        {/* Single Featured Story */}
        <div className="w-full max-w-4xl mx-auto">
          <div 
            onClick={() => navigate(`/story/enchanted-forest`)}
            className="group relative overflow-hidden rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(255,140,66,0.4)]"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop')",
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/95 via-deep-navy/70 to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-7 h-7 text-hero-orange" />
                <span className="font-fredoka text-hero-orange text-base sm:text-lg font-bold tracking-wider">
                  INTERACTIVE STORY
                </span>
              </div>

              <h2 className="font-fredoka text-4xl sm:text-5xl font-bold text-off-white mb-5 drop-shadow-xl">
                The Enchanted Forest
              </h2>

              <p className="font-dm-sans text-lg sm:text-xl text-off-white/90 mb-8 max-w-2xl leading-relaxed">
                Journey through a magical forest where you'll meet friendly creatures, discover hidden treasures, and use your voice and gestures to bring the story to life.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg">
                  <span className="font-dm-sans text-deep-navy font-semibold text-sm">🗣️ Voice Interactive</span>
                </div>
                <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg">
                  <span className="font-dm-sans text-deep-navy font-semibold text-sm">🤲 Gesture Detection</span>
                </div>
                <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg">
                  <span className="font-dm-sans text-deep-navy font-semibold text-sm">⏱️ 5-7 minutes</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 bg-hero-orange px-10 py-4 rounded-full hover:bg-hero-orange/90 transition-all duration-300 shadow-[0_8px_24px_rgba(255,140,66,0.5)] hover:shadow-[0_12px_32px_rgba(255,140,66,0.7)] group-hover:scale-105">
                <span className="font-fredoka text-xl sm:text-2xl font-bold text-white">
                  Start Adventure
                </span>
                <span className="text-2xl text-white transform group-hover:translate-x-2 transition-transform duration-300">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Stories;
