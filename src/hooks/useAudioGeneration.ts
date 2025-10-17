import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a simple hash for caching
const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useAudioGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateAudio = async (
    text: string,
    speaker: string,
    emotion: string = 'neutral'
  ): Promise<string | null> => {
    setIsLoading(true);

    try {
      // Generate cache key from text + speaker
      const cacheKey = `${speaker}_${await hashString(text)}`;
      const filePath = `${cacheKey}.mp3`;
      
      console.log(`Checking cache for: ${speaker} - "${text.substring(0, 30)}..."`);

      // Try to get from cache first
      const { data: existingFile } = await supabase.storage
        .from('audio-cache')
        .download(filePath);

      if (existingFile) {
        console.log('✓ Audio found in cache!');
        // Convert blob to base64
        const arrayBuffer = await existingFile.arrayBuffer();
        const base64Audio = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );
        setIsLoading(false);
        return base64Audio;
      }

      // Not in cache, generate via API
      console.log('✗ Not in cache, generating via API with key:', cacheKey);
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { text, speaker, emotion, cacheKey }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.audioContent) {
        console.error('No audio content in response:', data);
        throw new Error('No audio data received');
      }

      console.log('✓ Audio generated and should be cached');
      return data.audioContent;

    } catch (err) {
      console.error('Audio generation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioFromBase64 = (base64Audio: string, audioRef?: React.MutableRefObject<HTMLAudioElement | null>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audioBlob = base64ToBlob(base64Audio, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Store reference for cleanup
        if (audioRef) {
          audioRef.current = audio;
        }

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (audioRef) audioRef.current = null;
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          if (audioRef) audioRef.current = null;
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
