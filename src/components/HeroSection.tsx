import { Button } from "@/components/ui/button";
import { MagicalCursor } from "./MagicalCursor";
import { FloatingStars } from "./FloatingStars";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleVideoEnd = () => {
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 800);
    };
    
    video.addEventListener("ended", handleVideoEnd);
    return () => video.removeEventListener("ended", handleVideoEnd);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x: x * -3, y: y * -3 });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{ transform: `translate(${parallax.x}%, ${parallax.y}%) scale(1.15)` }}
      >
        <source
          src="https://res.cloudinary.com/duxxuvpkt/video/upload/v1760612324/final_video_kid_no_watermarks_ttagks.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-gradient-to-r from-deep-navy/80 to-transparent pointer-events-none" />

      <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-20 max-w-xl z-10">
        <h1 className="font-fredoka text-5xl md:text-6xl font-bold text-off-white leading-tight tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Stories That Come Alive
        </h1>
        
        <p className="font-dm-sans text-lg md:text-xl text-off-white mt-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Your voice. Your hero.
        </p>

        <div className="mt-6 bg-black/40 backdrop-blur-md rounded-2xl p-5 text-off-white">
          <p className="font-dm-sans text-base md:text-lg">Interactive speech therapy for neurodivergent children</p>
          <ul className="mt-2 space-y-1 text-sm md:text-base">
            <li>🗣️ Practice words through storytelling</li>
            <li>🤲 Learn through physical gestures</li>
            <li>👀 Engage multiple senses</li>
            <li>❤️ Told in your family's voice</li>
          </ul>
        </div>

        <p className="font-dm-sans text-sm text-off-white/90 mt-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Ages 4-7 • Multilingual • For neurodivergent children
        </p>

        <Button 
          size="lg"
          onClick={() => navigate("/stories")}
          className="bg-hero-orange hover:bg-hero-orange/90 text-off-white px-10 py-6 rounded-full font-fredoka text-xl font-semibold hover:scale-105 transition-all duration-300 shadow-2xl mt-10"
        >
          Start Your Adventure →
        </Button>
      </div>

      <MagicalCursor parallax={parallax} />
      
      <div 
        className="transition-transform duration-500 ease-out"
        style={{ transform: `translate(${parallax.x * 0.5}%, ${parallax.y * 0.5}%)` }}
      >
        <FloatingStars />
      </div>
    </section>
  );
};

export default HeroSection;
