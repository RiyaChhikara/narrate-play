import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DialogueLine {
  speaker: string;
  text: string;
  emotion: string;
}

interface Participation {
  type: 'choice' | 'word' | 'gesture' | 'object';
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

// Instant fallback story for demos
const DEMO_STORY: Story = {
  title: "The Magic Cloud Adventure",
  scenes: [
    {
      sceneNumber: 1,
      narration: [
        {
          speaker: "Mom",
          text: "Once upon a time, a friendly CLOUD floated in the sky.",
          emotion: "warm"
        },
        {
          speaker: "Dad",
          text: "Look! The cloud sees you and wants to say hello!",
          emotion: "excited"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Mom",
        prompt: "Can you WAVE hello to the cloud?",
        targetWord: "cloud",
        expectedResponses: ["wave"]
      },
      ambiance: "sky_sounds",
      music: "gentle_clouds"
    },
    {
      sceneNumber: 2,
      narration: [
        {
          speaker: "Mom",
          text: "The cloud waved back! It's so happy to meet you!",
          emotion: "joyful"
        },
        {
          speaker: "Dad",
          text: "Now it wants to show you a beautiful TREASURE on the left.",
          emotion: "mysterious"
        }
      ],
      participation: {
        type: "object",
        speaker: "Mom",
        prompt: "Can you find something BLUE and show it to us?",
        targetWord: "treasure",
        expectedResponses: ["blue"]
      },
      ambiance: "magic_sparkles",
      music: "discovery_theme"
    },
    {
      sceneNumber: 3,
      narration: [
        {
          speaker: "Dad",
          text: "Amazing! You found the blue treasure!",
          emotion: "proud"
        },
        {
          speaker: "Mom",
          text: "The treasure opens to reveal a magical RAINBOW!",
          emotion: "wonder"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Dad",
        prompt: "Can you JUMP for joy with the rainbow?",
        targetWord: "rainbow",
        expectedResponses: ["jump"]
      },
      ambiance: "rainbow_magic",
      music: "celebration"
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
