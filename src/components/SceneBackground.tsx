interface SceneBackgroundProps {
  sceneNumber: number;
}

export const SceneBackground = ({ sceneNumber }: SceneBackgroundProps) => {
  const getBackgroundStyle = () => {
    switch (sceneNumber % 5) {
      case 1:
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pattern: (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 text-6xl">🌙</div>
              <div className="absolute top-20 right-20 text-4xl animate-pulse">⭐</div>
              <div className="absolute bottom-20 left-20 text-5xl">✨</div>
              <div className="absolute top-1/2 right-10 text-3xl animate-pulse">⭐</div>
            </div>
          ),
        };
      case 2:
        return {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          pattern: (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-10 text-7xl">🏰</div>
              <div className="absolute top-40 right-20 text-5xl">🚩</div>
              <div className="absolute bottom-20 left-1/3 text-6xl">👑</div>
            </div>
          ),
        };
      case 3:
        return {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          pattern: (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-20 text-6xl">☁️</div>
              <div className="absolute top-1/3 right-10 text-7xl">☁️</div>
              <div className="absolute bottom-20 left-10 text-5xl">☁️</div>
              <div className="absolute top-2/3 left-1/2 text-4xl">🌈</div>
            </div>
          ),
        };
      case 4:
        return {
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          pattern: (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-10 text-8xl">🌳</div>
              <div className="absolute top-40 right-10 text-6xl">🌲</div>
              <div className="absolute bottom-10 left-1/3 text-7xl">🌴</div>
              <div className="absolute top-10 right-1/4 text-4xl animate-bounce">🦋</div>
            </div>
          ),
        };
      default:
        return {
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          pattern: (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-1/4 text-8xl">💎</div>
              <div className="absolute bottom-20 right-1/4 text-7xl">✨</div>
              <div className="absolute top-1/2 left-10 text-5xl animate-pulse">⭐</div>
            </div>
          ),
        };
    }
  };

  const { background, pattern } = getBackgroundStyle();

  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{ background }}
    >
      {pattern}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};
