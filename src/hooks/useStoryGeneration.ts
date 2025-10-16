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

export const useStoryGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = async (
    targetWords: string[],
    gestures: string[],
    childName?: string
  ): Promise<Story | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating story with:', { targetWords, gestures, childName });

      const { data, error: functionError } = await supabase.functions.invoke('generate-story', {
        body: { targetWords, gestures, childName }
      });

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
      console.error('Story generation error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateStory, isLoading, error };
};
