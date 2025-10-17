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

// Instant fallback story for demos - The Enchanted Forest
const DEMO_STORY: Story = {
  title: "The Enchanted Forest",
  scenes: [
    {
      sceneNumber: 1,
      narration: [
        {
          speaker: "Mom",
          text: "Welcome to the ENCHANTED FOREST! The trees are tall and magical.",
          emotion: "warm"
        },
        {
          speaker: "Dad",
          text: "Look! A friendly fairy appears on a sparkling leaf. She sees you!",
          emotion: "excited"
        },
        {
          speaker: "Mom",
          text: "The fairy wants to be your friend. She's waving at you!",
          emotion: "joyful"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Mom",
        prompt: "Can you WAVE hello to the fairy?",
        targetWord: "forest",
        expectedResponses: ["wave"]
      },
      ambiance: "forest_birds",
      music: "magical_forest"
    },
    {
      sceneNumber: 2,
      narration: [
        {
          speaker: "Dad",
          text: "The fairy waves back! She's so happy to meet you!",
          emotion: "joyful"
        },
        {
          speaker: "Mom",
          text: "She whispers a secret: There's a hidden TREASURE in the forest!",
          emotion: "mysterious"
        },
        {
          speaker: "Dad",
          text: "What's your favorite color? The treasure can be any color you choose!",
          emotion: "curious"
        }
      ],
      participation: {
        type: "word",
        speaker: "Mom",
        prompt: "Say your favorite color out loud!",
        targetWord: "treasure",
        expectedResponses: ["blue", "red", "green", "yellow", "purple", "pink", "orange"]
      },
      ambiance: "magic_sparkles",
      music: "mystery_theme"
    },
    {
      sceneNumber: 3,
      narration: [
        {
          speaker: "Mom",
          text: "What a beautiful color! The treasure chest appears and it glows with your color!",
          emotion: "excited"
        },
        {
          speaker: "Dad",
          text: "The chest opens and inside is a magical CRYSTAL that sparkles like stars!",
          emotion: "wonder"
        },
        {
          speaker: "Mom",
          text: "The crystal wants to see you celebrate! Can you show your joy?",
          emotion: "encouraging"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Dad",
        prompt: "Give the crystal a THUMBS UP to celebrate!",
        targetWord: "crystal",
        expectedResponses: ["thumbsup"]
      },
      ambiance: "crystal_chimes",
      music: "celebration"
    },
    {
      sceneNumber: 4,
      narration: [
        {
          speaker: "Dad",
          text: "You did it! The crystal lights up the whole forest!",
          emotion: "proud"
        },
        {
          speaker: "Mom",
          text: "A beautiful RAINBOW appears in the sky, painting everything with colors!",
          emotion: "wonder"
        },
        {
          speaker: "Dad",
          text: "The fairy, the forest, and all the animals want to thank you!",
          emotion: "grateful"
        }
      ],
      participation: {
        type: "gesture",
        speaker: "Mom",
        prompt: "Give everyone a big THUMBS UP!",
        targetWord: "rainbow",
        expectedResponses: ["thumbsup"]
      },
      ambiance: "rainbow_magic",
      music: "grand_finale"
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
    // ALWAYS use the fixed demo story - no API calls, no dynamic generation
    console.log('Using fixed demo story (no API calls)');
    setIsLoading(false);
    return DEMO_STORY;
  };

  return { generateStory, isLoading, error };
};
