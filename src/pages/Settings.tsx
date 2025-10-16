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
      <div className="container mx-auto px-4 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-fredoka text-4xl font-bold text-off-white">Settings</h1>
        </div>

        <Card className="bg-secondary border-l-4 border-hero-orange mb-6">
          <CardContent className="p-8">
            <h2 className="font-fredoka text-2xl font-bold text-deep-navy mb-6">
              Learning Progress
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-8 h-8 text-hero-orange" />
                </div>
                <p className="font-fredoka text-3xl font-bold text-deep-navy">3</p>
                <p className="font-dm-sans text-sm text-muted-foreground">Stories</p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Target className="w-8 h-8 text-hero-orange" />
                </div>
                <p className="font-fredoka text-3xl font-bold text-deep-navy">24</p>
                <p className="font-dm-sans text-sm text-muted-foreground">Words Learned</p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-8 h-8 text-hero-orange" />
                </div>
                <p className="font-fredoka text-3xl font-bold text-deep-navy">7</p>
                <p className="font-dm-sans text-sm text-muted-foreground">Day Streak</p>
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
