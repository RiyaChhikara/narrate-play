import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const SUGGESTED_WORDS = [
  "MAGIC",
  "DRAGON",
  "CASTLE",
  "CLOUD",
  "STAR",
  "MOON",
  "RAINBOW",
  "TREASURE",
];

export const WordsManager = () => {
  const [expanded, setExpanded] = useState(false);
  const [words, setWords] = useState<string[]>(() => {
    const saved = localStorage.getItem("words");
    return saved ? JSON.parse(saved) : ["TREASURE", "CRYSTAL", "FOREST", "RAINBOW"];
  });
  const [newWord, setNewWord] = useState("");

  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words));
  }, [words]);

  const addWord = (word: string) => {
    const upperWord = word.toUpperCase().trim();
    if (upperWord && words.length < 20 && !words.includes(upperWord)) {
      setWords([...words, upperWord]);
      setNewWord("");
    }
  };

  const removeWord = (word: string) => {
    setWords(words.filter((w) => w !== word));
  };

  return (
    <Card className="bg-white border-2 border-border">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-fredoka text-2xl text-deep-navy">Magic Words</CardTitle>
            <CardDescription className="font-dm-sans">
              Add up to 20 special words
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {words.map((word) => (
            <div
              key={word}
              className="inline-flex items-center gap-2 bg-hero-orange/10 px-3 py-2 rounded-lg border-2 border-hero-orange"
            >
              <span className="font-dm-sans text-sm font-medium">{word}</span>
              <button
                onClick={() => removeWord(word)}
                className="text-hero-orange hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {expanded && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addWord(newWord)}
                placeholder="Add a new word..."
                className="font-dm-sans"
                maxLength={15}
              />
              <Button
                onClick={() => addWord(newWord)}
                disabled={words.length >= 20 || !newWord.trim()}
                className="bg-hero-orange hover:bg-hero-orange/90 text-white font-dm-sans"
              >
                Add
              </Button>
            </div>

            <div>
              <p className="font-dm-sans text-sm text-muted-foreground mb-2">
                Suggested words:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_WORDS.filter((w) => !words.includes(w)).map((word) => (
                  <button
                    key={word}
                    onClick={() => addWord(word)}
                    disabled={words.length >= 20}
                    className="px-3 py-1 rounded-lg border-2 border-border hover:border-hero-orange hover:bg-hero-orange/10 transition-colors font-dm-sans text-sm disabled:opacity-50"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
