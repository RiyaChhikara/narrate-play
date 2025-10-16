import { useEffect, useState } from "react";

const SCENE_KEYWORDS = [
  "magical+forest+fantasy",
  "treasure+chest+golden",
  "castle+fairytale+fantasy",
  "celebration+party+colorful",
  "stars+night+magical"
];

export const SceneBackground = ({ sceneNumber }: { sceneNumber: number }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    setImageLoaded(false);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [sceneNumber]);

  const keywords = SCENE_KEYWORDS[(sceneNumber - 1) % SCENE_KEYWORDS.length];
  const imageUrl = `https://source.unsplash.com/1920x1080/?${keywords}`;

  return (
    <div className="absolute inset-0">
      {/* Unsplash background image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'}`}
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          opacity: imageLoaded ? 1 : 0
        }}
      >
        <img 
          src={imageUrl} 
          alt="" 
          className="hidden"
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Fallback gradient while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 animate-pulse" />
      )}

      {/* Dark overlay with blur for better text readability and depth */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50 backdrop-blur-[2px] transition-opacity duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-90'}`} />
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-60 animate-float"
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
    </div>
  );
};
