import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DialogueLine {
  speaker: string;
  text: string;
  emotion: string;
}

interface Participation {
  type: 'choice' | 'word' | 'gesture' | 'speech';
  speaker: string;
  prompt: string;
  targetWord: string;
  expectedResponses?: string[];
}

export interface StoryScene {
  sceneNumber: number;
  narration: DialogueLine[];
  participation: Participation;
  ambiance: string;
  music: string;
}

export interface Story {
  title: string;
  scenes: StoryScene[];
}

// Enhanced "Enchanted Forest" story
const DEMO_STORY: Story = {
  title: "The Enchanted Forest",
  scenes: [
    {
      sceneNumber: 1,
      narration: [
        {
          speaker: "Mom",
          text: "Welcome, brave explorer! You've entered the Enchanted Forest where magic is real.",
          emotion: "warm"
        },
        {
          speaker: "Dad",
          text: "Look! A friendly forest fairy appears in a shimmer of light. She needs your help!",
          emotion: "excited"
        },
        {
          speaker: "Mom",
          text: "The fairy says: 'Hello dear friend! I've lost my way. Can you help me?'",
          emotion: "gentle"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Dad",
        prompt: "Show the fairy you're friendly! Can you WAVE hello?",
        targetWord: "fairy",
        expectedResponses: ["wave"]
      },
      ambiance: "forest_sounds",
      music: "magical_forest"
    },
    {
      sceneNumber: 2,
      narration: [
        {
          speaker: "Mom",
          text: "The fairy claps her hands with joy! You're so kind!",
          emotion: "happy"
        },
        {
          speaker: "Dad",
          text: "She whispers a secret: 'Deep in the forest, there's a hidden TREASURE that can light up the dark paths.'",
          emotion: "mysterious"
        },
        {
          speaker: "Mom",
          text: "But first, we need to know... what's your favorite thing to find on an adventure?",
          emotion: "curious"
        }
      ],
      participation: {
        type: "speech",
        speaker: "Dad",
        prompt: "Tell us: Do you like finding treasures, animals, or magical flowers?",
        targetWord: "treasure",
        expectedResponses: ["treasure", "animals", "flowers", "gold", "crystals"]
      },
      ambiance: "mystery_sounds",
      music: "adventure_theme"
    },
    {
      sceneNumber: 3,
      narration: [
        {
          speaker: "Dad",
          text: "Perfect choice! The fairy leads you through sparkling trees to a glowing chest!",
          emotion: "excited"
        },
        {
          speaker: "Mom",
          text: "Inside is the most beautiful RAINBOW crystal you've ever seen! It glows with all the colors!",
          emotion: "amazed"
        },
        {
          speaker: "Dad",
          text: "The fairy smiles and says: 'You did it! Now the forest can shine bright again!'",
          emotion: "proud"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Mom",
        prompt: "The forest celebrates! Can you give a big THUMBS UP for saving the day?",
        targetWord: "crystal",
        expectedResponses: ["thumbsup", "clap"]
      },
      ambiance: "celebration_sounds",
      music: "victory_theme"
    }
  ]
};

export const useStoryGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = async (
    targetWords: string[],
    gestures: string[],
    childName?: string,
    useDemoMode: boolean = false,
    languages?: string[]
  ): Promise<Story | null> => {
    setIsLoading(true);
    setError(null);

    // Instant demo story for presentations
    if (useDemoMode) {
      console.log('Using demo story (instant)');
      setIsLoading(false);
      return DEMO_STORY;
    }

    try {
      console.log('Generating story with:', { targetWords, gestures, childName });

      // Set a 10-second timeout for AI generation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Story generation timeout')), 10000)
      );

      const generatePromise = supabase.functions.invoke('generate-story', {
        body: { targetWords, gestures, childName, languages }
      });

      const { data, error: functionError } = await Promise.race([
        generatePromise,
        timeoutPromise
      ]) as any;

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data) {
        throw new Error('No story data received');
      }

      console.log('Story generated:', data);
      return data as Story;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story';
      console.error('Story generation error, using fallback:', err);
      setError(errorMessage);
      
      // Return demo story as fallback
      console.log('Using demo story as fallback');
      return DEMO_STORY;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateStory, isLoading, error };
};
