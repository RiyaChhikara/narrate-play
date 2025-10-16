interface ProgressPathProps {
  currentScene: number;
  totalScenes: number;
}

export const ProgressPath = ({ currentScene, totalScenes }: ProgressPathProps) => {
  const icons = ['🏠', '🌳', '🏰', '💎', '🌟', '🎉', '👑'];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-2xl border-2 border-white">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalScenes }).map((_, index) => {
            const isCompleted = index < currentScene;
            const isCurrent = index === currentScene - 1;
            const icon = icons[index % icons.length];

            return (
              <div key={index} className="flex items-center">
                <div
                  className={`
                    text-3xl transition-all duration-300
                    ${isCurrent ? 'scale-150 animate-bounce' : ''}
                    ${isCompleted ? 'opacity-100 grayscale-0' : 'opacity-30 grayscale'}
                  `}
                >
                  {icon}
                </div>
                {index < totalScenes - 1 && (
                  <div
                    className={`
                      w-8 h-1 mx-1 rounded-full transition-all duration-500
                      ${isCompleted ? 'bg-hero-orange' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
