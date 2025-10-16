import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Stories = () => {
  const navigate = useNavigate();

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
          <h1 className="font-fredoka text-4xl font-bold text-off-white">Your Story Adventure</h1>
        </div>

        {/* Single Featured Story */}
        <div className="w-full max-w-3xl mx-auto">
          <div 
            onClick={() => navigate(`/story/enchanted-forest`)}
            className="group relative overflow-hidden rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,140,66,0.6)]"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop')",
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/95 via-deep-navy/60 to-transparent" />
            
            {/* Floating Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-float opacity-70"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 p-12">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-hero-orange animate-pulse" />
                <span className="font-fredoka text-hero-orange text-lg font-bold tracking-wide">
                  INTERACTIVE STORY
                </span>
              </div>

              <h2 className="font-fredoka text-5xl font-bold text-off-white mb-4 drop-shadow-lg">
                The Enchanted Forest
              </h2>

              <p className="font-dm-sans text-xl text-off-white/90 mb-8 max-w-xl leading-relaxed">
                Journey through a magical forest where you'll meet friendly creatures, discover hidden treasures, and use your voice and gestures to bring the story to life!
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="bg-hero-orange/90 backdrop-blur-sm px-5 py-2 rounded-full">
                  <span className="font-dm-sans text-white font-semibold">🗣️ Voice Interactive</span>
                </div>
                <div className="bg-hero-orange/90 backdrop-blur-sm px-5 py-2 rounded-full">
                  <span className="font-dm-sans text-white font-semibold">🤲 Gesture Detection</span>
                </div>
                <div className="bg-hero-orange/90 backdrop-blur-sm px-5 py-2 rounded-full">
                  <span className="font-dm-sans text-white font-semibold">⏱️ 5-7 minutes</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full group-hover:bg-hero-orange transition-colors duration-300">
                <span className="font-fredoka text-2xl font-bold text-deep-navy group-hover:text-white transition-colors">
                  Start Adventure
                </span>
                <span className="text-2xl transform group-hover:translate-x-2 transition-transform duration-300">
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
