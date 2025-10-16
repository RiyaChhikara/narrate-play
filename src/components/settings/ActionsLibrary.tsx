import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Action {
  id: string;
  name: string;
  emoji: string;
}

const ACTIONS: Action[] = [
  { id: "wave", name: "Wave", emoji: "👋" },
  { id: "point", name: "Point", emoji: "☝️" },
  { id: "clap", name: "Clap", emoji: "👏" },
  { id: "thumbsup", name: "Thumbs Up", emoji: "👍" },
  { id: "jump", name: "Jump", emoji: "🦘" },
  { id: "spin", name: "Spin Around", emoji: "🌀" },
  { id: "nod", name: "Nod", emoji: "🙂" },
  { id: "shake", name: "Shake Head", emoji: "🙃" },
  { id: "wiggle", name: "Wiggle Fingers", emoji: "🖐️" },
];

export const ActionsLibrary = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedActions");
    return saved ? JSON.parse(saved) : ["wave", "point", "clap"];
  });

  useEffect(() => {
    localStorage.setItem("selectedActions", JSON.stringify(selectedActions));
  }, [selectedActions]);

  const toggleAction = (id: string) => {
    if (selectedActions.includes(id)) {
      if (selectedActions.length > 3) {
        setSelectedActions(selectedActions.filter((a) => a !== id));
      }
    } else {
      if (selectedActions.length < 6) {
        setSelectedActions([...selectedActions, id]);
      }
    }
  };

  return (
    <Card className="bg-white border-2 border-border">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-fredoka text-2xl text-deep-navy">Actions</CardTitle>
            <CardDescription className="font-dm-sans">
              Choose 3-6 physical actions
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!expanded && (
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedActions.map((id) => {
              const action = ACTIONS.find((a) => a.id === id);
              return (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 bg-hero-orange/10 px-4 py-2 rounded-lg border-2 border-hero-orange"
                >
                  <span className="text-2xl">{action?.emoji}</span>
                  <span className="font-dm-sans text-sm font-medium">{action?.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {expanded && (
          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-secondary transition-colors"
              >
                <Checkbox
                  checked={selectedActions.includes(action.id)}
                  onCheckedChange={() => toggleAction(action.id)}
                  disabled={
                    !selectedActions.includes(action.id) && selectedActions.length >= 6
                  }
                />
                <span className="text-3xl">{action.emoji}</span>
                <span className="font-dm-sans text-sm font-medium flex-1">{action.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
