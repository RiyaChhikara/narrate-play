import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { VoiceRecorder } from "@/components/settings/VoiceRecorder";
import { ActionsLibrary } from "@/components/settings/ActionsLibrary";
import { WordsManager } from "@/components/settings/WordsManager";
import BottomNav from "@/components/BottomNav";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-800 pb-24">
      <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 backdrop-blur-md rounded-full p-3 hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-off-white tracking-wide">Settings</h1>
        </div>

        <Card className="bg-white/95 backdrop-blur-xl border-none shadow-xl mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-deep-navy mb-6">
              Learning Progress
            </h2>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="bg-hero-orange/10 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 transition-all duration-300 hover:bg-hero-orange/20">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-hero-orange" />
                </div>
                <p className="font-fredoka text-2xl sm:text-3xl font-bold text-deep-navy">3</p>
                <p className="font-dm-sans text-xs sm:text-sm text-muted-foreground">Stories</p>
              </div>
              <div className="text-center">
                <div className="bg-hero-orange/10 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 transition-all duration-300 hover:bg-hero-orange/20">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-hero-orange" />
                </div>
                <p className="font-fredoka text-2xl sm:text-3xl font-bold text-deep-navy">24</p>
                <p className="font-dm-sans text-xs sm:text-sm text-muted-foreground">Words Learned</p>
              </div>
              <div className="text-center">
                <div className="bg-hero-orange/10 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 transition-all duration-300 hover:bg-hero-orange/20">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-hero-orange" />
                </div>
                <p className="font-fredoka text-2xl sm:text-3xl font-bold text-deep-navy">7</p>
                <p className="font-dm-sans text-xs sm:text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <LanguageSelector />
          <VoiceRecorder />
          <ActionsLibrary />
          <WordsManager />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
