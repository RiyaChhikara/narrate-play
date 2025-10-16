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
    const { text, speaker, emotion } = await req.json();

    const elevenLabsKey = Deno.env.get('ELEVENLABS_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVENLABS_KEY not configured');
    }

    // Voice mapping - using ElevenLabs voices
    const voiceMap: Record<string, string> = {
      'Mom': '9BWtsMINqrJLrRacOk9x', // Aria - warm, nurturing
      'Dad': 'N2lVS1w4EtoT3dr4eOWO', // Callum - friendly, excited
      'Narrator': 'pFZP5JQG7iQjIQuC4Bku', // Lily - magical, storyteller
      'Friend': 'XB0fDUnXU5powFXDhCwa', // Charlotte - playful
      'default': '9BWtsMINqrJLrRacOk9x' // Aria as default
    };

    const voiceId = voiceMap[speaker] || voiceMap['default'];

    console.log(`Generating audio for speaker: ${speaker}, voice: ${voiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: emotion === 'excited' ? 0.8 : 0.5,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for easier transmission
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log('Audio generated successfully');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        speaker: speaker
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to generate audio'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
