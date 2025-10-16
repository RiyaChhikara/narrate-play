import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "zh", name: "Mandarin", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "ar", name: "Arabic", flag: "🇦🇪" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "ta", name: "Tamil", flag: "🇹🇭" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
];

export const LanguageSelector = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedLanguages");
    return saved ? JSON.parse(saved) : ["en"];
  });
  const [primaryLanguage, setPrimaryLanguage] = useState<string>(() => {
    return localStorage.getItem("primaryLanguage") || "en";
  });

  useEffect(() => {
    localStorage.setItem("selectedLanguages", JSON.stringify(selectedLanguages));
    localStorage.setItem("primaryLanguage", primaryLanguage);
  }, [selectedLanguages, primaryLanguage]);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== code));
        if (primaryLanguage === code) {
          setPrimaryLanguage(selectedLanguages.find((l) => l !== code) || "en");
        }
      }
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  return (
    <Card className="bg-white border-2 border-border">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-fredoka text-2xl text-deep-navy">Languages</CardTitle>
            <CardDescription className="font-dm-sans">
              Choose languages for stories
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!expanded && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLanguages.map((code) => {
              const lang = LANGUAGES.find((l) => l.code === code);
              return (
                <div
                  key={code}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-hero-orange"
                >
                  <span className="text-xl">{lang?.flag}</span>
                  <span className="font-dm-sans text-sm">{lang?.name}</span>
                  {primaryLanguage === code && (
                    <Star className="w-4 h-4 text-hero-orange fill-hero-orange" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {expanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Checkbox
                    checked={selectedLanguages.includes(lang.code)}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                  />
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-dm-sans text-sm flex-1">{lang.name}</span>
                  {selectedLanguages.includes(lang.code) && (
                    <button
                      onClick={() => setPrimaryLanguage(lang.code)}
                      className={`transition-colors ${
                        primaryLanguage === lang.code ? "text-hero-orange" : "text-muted-foreground"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          primaryLanguage === lang.code ? "fill-hero-orange" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
