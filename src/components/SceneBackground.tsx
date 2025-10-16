import { useEffect, useState } from 'react';
import crystalTreasure from '@/assets/crystal-treasure.jpg';

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
    // Scene 3: Crystal Treasure
    if (sceneNumber === 2) {
      return {
        backgroundImage: `url(${crystalTreasure})`,
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
          // Forest: Subtle floating leaves
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl opacity-30 animate-float"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 20}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${8 + i}s`,
                }}
              >
                🍃
              </div>
            ))}
          </>
        )}
        
        {sceneNumber === 1 && (
          // Treasure: Gentle sparkles
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute text-xl opacity-40"
                style={{
                  left: `${25 + i * 20}%`,
                  top: `${30 + i * 15}%`,
                  animation: `pulse ${3 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              >
                ✨
              </div>
            ))}
          </>
        )}
        
        {sceneNumber === 2 && (
          // Crystal: Subtle stars
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute text-lg opacity-50"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${25 + i * 15}%`,
                  animation: `pulse ${4 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.6}s`,
                }}
              >
                ⭐
              </div>
            ))}
          </>
        )}
        
        {sceneNumber === 3 && (
          // Rainbow: Gentle celebration
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-60 animate-float"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + i * 12}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${5 + i * 0.5}s`,
                }}
              >
                {['🌈', '✨', '⭐'][i % 3]}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};
