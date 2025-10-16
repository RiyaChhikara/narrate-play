import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Mic } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export const VoiceRecorder = () => {
  const [expanded, setExpanded] = useState(false);
  const [voices, setVoices] = useState<Voice[]>(() => {
    const saved = localStorage.getItem("voices");
    return saved
      ? JSON.parse(saved)
      : [{ id: "default", name: "Rachel (Default)", icon: "🎙️", isActive: true }];
  });

  useEffect(() => {
    localStorage.setItem("voices", JSON.stringify(voices));
  }, [voices]);

  const setActiveVoice = (id: string) => {
    setVoices(voices.map((v) => ({ ...v, isActive: v.id === id })));
  };

  return (
    <Card className="bg-white border-2 border-border">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-fredoka text-2xl text-deep-navy">Voice Library</CardTitle>
            <CardDescription className="font-dm-sans">
              Family voices for storytelling
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!expanded && (
          <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
            <span className="text-3xl">{voices.find((v) => v.isActive)?.icon}</span>
            <div>
              <p className="font-dm-sans font-medium text-deep-navy">
                {voices.find((v) => v.isActive)?.name}
              </p>
              <p className="font-dm-sans text-xs text-muted-foreground">Active voice</p>
            </div>
          </div>
        )}

        {expanded && (
          <div className="space-y-4">
            <div className="space-y-3">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    voice.isActive
                      ? "border-hero-orange bg-hero-orange/10"
                      : "border-border hover:border-hero-orange/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{voice.icon}</span>
                    <div>
                      <p className="font-dm-sans font-medium text-deep-navy">{voice.name}</p>
                      {voice.isActive && (
                        <p className="font-dm-sans text-xs text-hero-orange">Active</p>
                      )}
                    </div>
                  </div>
                  {!voice.isActive && (
                    <Button
                      onClick={() => setActiveVoice(voice.id)}
                      variant="outline"
                      size="sm"
                      className="font-dm-sans"
                    >
                      Use This Voice
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-2 border-hero-orange text-hero-orange hover:bg-hero-orange hover:text-white font-dm-sans"
            >
              <Mic className="w-4 h-4 mr-2" />
              Record New Voice
            </Button>

            <p className="font-dm-sans text-xs text-muted-foreground text-center">
              Voice recording feature coming soon with ElevenLabs integration
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
