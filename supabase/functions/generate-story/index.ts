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

    const primaryLanguage = languageNames[0] || "English";
    const secondaryLanguage = languageNames[1] || null;
    const isMultilingual = languageNames.length > 1;

    const storyPrompt = `You are creating an interactive children's story. Follow these EXACT requirements:

🎯 CRITICAL CONSTRAINTS (MUST FOLLOW):

1. MAGIC WORDS TO USE (MANDATORY):
   Words: ${targetWords.join(', ')}
   - Each scene MUST feature ONE of these words as the key focus
   - Make these words EXCITING and central to the scene
   - ${isMultilingual ? `Use BOTH languages for magic words. Format: "WORD (translation)"` : 'Emphasize these words dramatically'}
   - Example: "Look! A magical KHAZANA (TREASURE) appears! ✨"

2. ACTIONS/GESTURES (MANDATORY):
   Available actions: ${gestures.join(', ')}
   - ONLY use actions from this list
   - Each scene needs ONE participation moment using these actions
   - Make actions feel natural and fun
   - Example: If "wave" is available, use "Wave hello to the dragon!"

3. LANGUAGES (MANDATORY):
   ${isMultilingual ? 
     `Primary: ${primaryLanguage}, Secondary: ${secondaryLanguage}
   - Use ${primaryLanguage} for narration
   - Use ${secondaryLanguage} for magic words and key phrases
   - Code-switch naturally: "The hero found a KHAZANA (treasure)! Can you say KHAZANA?"
   - Repeat important words in both languages` :
     `Language: ${primaryLanguage} only`
   }

4. CHILD'S NAME: ${childName || 'the brave hero'}

5. STORY STRUCTURE:
   - Create exactly 5 scenes
   - Each scene: 30-60 seconds of dialogue
   - Characters: Mom, Dad, Narrator (rotate speakers)
   - Build excitement and celebrate participation

PARTICIPATION TYPES (rotate through these):
- "gesture": Ask child to perform a physical action (${gestures.slice(0, 3).join(', ')})
- "word": Ask child to repeat a magic word in both languages
- "choice": Ask child to make a choice
- "object": Ask child to find/show something

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
            content: `You are a creative children's story writer specializing in interactive, educational stories. 
You MUST follow ALL constraints provided about magic words, actions, and languages.
You MUST return ONLY valid JSON with no markdown formatting or code blocks.
Make the story exciting and ensure every magic word and action from the user's settings appears in the story.`
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
