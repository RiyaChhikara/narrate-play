interface SceneBackgroundProps {
  sceneNumber: number;
  totalScenes: number;
}

export const SceneBackground = ({ sceneNumber, totalScenes }: SceneBackgroundProps) => {
  const getBackgroundStyle = () => {
    // Scene 1: Forest
    if (sceneNumber === 0) {
      return {
        backgroundImage: "url('https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Scene 2: Treasure/Mystery
    if (sceneNumber === 1) {
      return {
        backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=1080&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Scene 3: Crystal Cave
    if (sceneNumber === 2) {
      return {
        backgroundImage: "url('https://images.unsplash.com/photo-1484542603127-984f4f7f14e7?w=1920&h=1080&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Scene 4: Rainbow/Celebration
    return {
      backgroundImage: "url('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&h=1080&fit=crop')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  return (
    <>
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={getBackgroundStyle()}
      />
      
      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      {/* Animated Scene Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {sceneNumber === 0 && (
          // Forest: Floating leaves
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-4xl opacity-40 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 3}s`,
                }}
              >
                🍃
              </div>
            ))}
          </>
        )}
        
        {sceneNumber === 1 && (
          // Treasure: Sparkles
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-60 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                ✨
              </div>
            ))}
          </>
        )}
        
        {sceneNumber === 2 && (
          // Crystal: Stars
          <>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute text-xl opacity-70 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                ⭐
              </div>
            ))}
          </>
        )}
        
        {sceneNumber === 3 && (
          // Rainbow: Colorful confetti
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl opacity-80 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                {['🌈', '🎉', '⭐', '✨'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};
