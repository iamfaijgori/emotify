import google.generativeai as genai
from django.conf import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="""
You are the music intelligence engine for Emotify, an AI music player.

Your job is to analyze user voice input and extract structured music preferences.

Always respond with ONLY a valid JSON object — no explanation, no extra text, no markdown.

JSON structure:
{
    "mood": "happy | sad | romantic | energetic | calm | devotional | party | focused | angry | neutral",
    "language": "hindi | english | punjabi | tamil | telugu | bengali | marathi | mixed",
    "genre": "bollywood | pop | rock | classical | jazz | hip_hop | devotional | romantic | party | sufi | indie",
    "era": "60s | 70s | 80s | 90s | 2000s | 2010s | latest | any",
    "artist": "artist name if specifically mentioned, else empty string",
    "song": "specific song name if mentioned, else empty string",
    "search_query": "the optimized YouTube search query string to find this music",
    "is_specific_song": true or false,
    "greeting_response": "a short warm 1 sentence response to say before playing"
}

Rules:
- search_query must be in English and optimized for YouTube search
- If user says a specific song name, set is_specific_song to true
- greeting_response should feel human and warm, max 15 words
- If language is hindi, include 'hindi' in search_query
- For era, map 'purane gaane' or 'old songs' to 90s or 80s accordingly
- Default language to hindi if unclear from context
- Always return valid JSON, nothing else
"""
)


def parse_music_intent(user_text):
    try:
        response      = model.generate_content(user_text)
        response_text = response.text.strip()

        # Strip markdown code fences if Gemini adds them
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        result = json.loads(response_text.strip())
        return result

    except json.JSONDecodeError:
        return {
            "mood":              "neutral",
            "language":          "hindi",
            "genre":             "bollywood",
            "era":               "any",
            "artist":            "",
            "song":              "",
            "search_query":      user_text,
            "is_specific_song":  False,
            "greeting_response": "Sure! Let me find some music for you.",
        }

    except Exception as e:
        print(f"Gemini API error: {e}")
        return None