import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetWords, gestures, childName, languages = ["en"] } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const languageNames = languages.map((code: string) => {
      const langMap: Record<string, string> = {
        en: "English", hi: "Hindi", es: "Spanish", fr: "French", de: "German",
        it: "Italian", pt: "Portuguese", zh: "Mandarin", ja: "Japanese", ko: "Korean"
      };
      return langMap[code] || code;
    });

    const storyPrompt = `Create an interactive multilingual children's story with code-switching.

LANGUAGES: The child speaks ${languageNames.join(' and ')}
INSTRUCTIONS FOR MULTILINGUAL STORYTELLING:
- Mix languages naturally (code-switching)
- Use English for main narration
- Use ${languageNames[1] || languageNames[0]} for key "Magic Words" and character dialogue
- Repeat important words in both languages
- Example: "The hero found a KHAZANA (treasure)! Can you say KHAZANA?"

TARGET MAGIC WORDS: ${targetWords.join(', ')}
These words MUST appear in the story. Use them in both languages with translation.

GESTURES/ACTIONS: ${gestures.join(', ')}
The story should prompt these physical actions only.

CHILD'S NAME: ${childName || 'the brave hero'}

Create a magical adventure story with 5 scenes. Each scene should:
1. Have dialogue between 2-3 characters (Mom/Parent, Dad/Friend, Narrator)
2. Include ONE participation moment where the child gets to interact
3. Be 30-60 seconds of dialogue
4. Naturally incorporate one target word in both languages
5. Build excitement and encourage the child
6. Code-switch naturally between languages

Participation types to rotate:
- CHOICE: Ask child to choose (color, direction, object)
- WORD: Have characters say a target word in both languages, pause for child to repeat
- GESTURE: Ask child to do a physical action
- OBJECT: Ask child to find and show an object

Return ONLY valid JSON in this exact format:
{
  "title": "The Magical Adventure",
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": [
        {
          "speaker": "Mom",
          "text": "Once upon a time, in a magical forest...",
          "emotion": "warm"
        },
        {
          "speaker": "Dad",
          "text": "I'm so excited! Should we explore?",
          "emotion": "excited"
        }
      ],
      "participation": {
        "type": "choice",
        "speaker": "Mom",
        "prompt": "What COLOR do you think the treasure chest is?",
        "targetWord": "treasure",
        "expectedResponses": ["blue", "red", "green", "gold"]
      },
      "ambiance": "forest_sounds",
      "music": "gentle_adventure"
    }
  ]
}

Make it magical, encouraging, and full of wonder. Characters should celebrate the child's participation enthusiastically!`;

    console.log('Generating story with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative children\'s story writer who creates interactive, educational, and magical stories. You MUST return ONLY valid JSON with no markdown formatting or code blocks.'
          },
          {
            role: 'user',
            content: storyPrompt
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let storyJson = data.choices[0].message.content;
    
    console.log('Raw story response:', storyJson.substring(0, 200));

    // Clean JSON response (remove markdown code blocks if present)
    storyJson = storyJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Story generated successfully');

    // Parse to validate JSON
    const story = JSON.parse(storyJson);

    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to generate story'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
