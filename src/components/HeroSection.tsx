import { Button } from "@/components/ui/button";
import { MagicalCursor } from "./MagicalCursor";
import { FloatingStars } from "./FloatingStars";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.15; // Low volume for ambient sound
      audio.play().catch(err => console.log("Audio autoplay blocked:", err));
    }
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
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source
          src="https://cdn.pixabay.com/audio/2024/09/04/audio_e4dc54fe22.mp3"
          type="audio/mpeg"
        />
      </audio>
      
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

      <div className="absolute top-0 left-0 bottom-0 w-2/3 md:w-1/2 bg-gradient-to-r from-deep-navy/80 to-transparent pointer-events-none" />

      <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-8 sm:pl-12 md:pl-16 lg:pl-20 max-w-xl lg:max-w-2xl z-10">
        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white leading-tight tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mb-6">
          Stories That Come Alive
        </h1>
        
        <p className="font-dm-sans text-xl sm:text-2xl text-off-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] font-medium mb-8">
          Your voice. Your hero.
        </p>

        {/* Value Proposition Panel */}
        <div className="max-w-lg mt-8 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)]">
          <p className="font-dm-sans text-base sm:text-lg text-deep-navy mb-4 font-semibold">
            Interactive speech therapy for kids
          </p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="text-xl">🗣️</span>
              <p className="font-dm-sans text-deep-navy/80 text-sm sm:text-base leading-relaxed">Practice words through storytelling</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🤲</span>
              <p className="font-dm-sans text-deep-navy/80 text-sm sm:text-base leading-relaxed">Learn through physical gestures</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">👀</span>
              <p className="font-dm-sans text-deep-navy/80 text-sm sm:text-base leading-relaxed">Engage multiple senses</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">❤️</span>
              <p className="font-dm-sans text-deep-navy/80 text-sm sm:text-base leading-relaxed">Told in your family's voice</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mt-6">
          <Button 
            size="lg"
            onClick={() => navigate("/stories")}
            className="w-full bg-hero-orange hover:bg-hero-orange/90 text-white px-12 py-6 rounded-full font-fredoka text-xl font-semibold hover:scale-105 transition-all duration-300 shadow-[0_8px_24px_rgba(255,140,66,0.5)] hover:shadow-[0_12px_32px_rgba(255,140,66,0.7)]"
          >
            Start Your Adventure →
          </Button>
        </div>
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
