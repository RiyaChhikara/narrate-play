import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudioGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateAudio = async (
    text: string,
    speaker: string,
    emotion: string = 'neutral'
  ): Promise<string | null> => {
    setIsLoading(true);

    try {
      console.log(`Generating audio for: ${speaker}`);

      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { text, speaker, emotion }
      });

      if (error) {
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error('No audio data received');
      }

      return data.audioContent;

    } catch (err) {
      console.error('Audio generation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audioBlob = base64ToBlob(base64Audio, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  };

  return { generateAudio, playAudioFromBase64, isLoading };
};

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string, contentType: string = ''): Blob => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
