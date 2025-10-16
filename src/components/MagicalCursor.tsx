import { useEffect, useState } from "react";

interface MagicalCursorProps {
  parallax?: { x: number; y: number };
}

export const MagicalCursor = ({ parallax }: MagicalCursorProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer glow */}
      <div
        className="fixed pointer-events-none z-50 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hero-orange/30 blur-lg transition-all duration-200"
        style={{
          left: position.x,
          top: position.y,
        }}
      />
      {/* Inner dot */}
      <div
        className="fixed pointer-events-none z-50 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hero-orange transition-all duration-100"
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    </>
  );
};
