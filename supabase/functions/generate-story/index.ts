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
    const { targetWords, gestures, childName } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const storyPrompt = `Create an interactive children's story script with these specifications:

TARGET WORDS: ${targetWords.join(', ')}
GESTURES: ${gestures.join(', ')}
CHILD'S NAME: ${childName || 'the brave hero'}

Create a magical adventure story with 5 scenes. Each scene should:
1. Have dialogue between 2-3 characters (Mom/Parent, Dad/Friend, Narrator)
2. Include ONE participation moment where the child gets to interact
3. Be 30-60 seconds of dialogue
4. Naturally incorporate one target word
5. Build excitement and encourage the child

Participation types to rotate:
- CHOICE: Ask child to choose (color, direction, object)
- WORD: Have characters say a target word, pause for child to repeat
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
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a creative children\'s story writer who creates interactive, educational, and magical stories. Always return valid JSON.'
          },
          {
            role: 'user',
            content: storyPrompt
          }
        ],
        temperature: 0.8,
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const storyJson = data.choices[0].message.content;
    
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
