from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .gemini_client import parse_music_intent
from music.youtube import search_youtube


class ParseIntentView(APIView):
    """
    Takes voice text → gemini parses intent → YouTube search runs →
    Returns both the parsed intent AND the song results in one shot.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_text = request.data.get('text', '').strip()

        if not user_text:
            return Response(
                {'error': 'text field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 1 — gemini parses the intent
        intent = parse_music_intent(user_text)

        if not intent:
            return Response(
                {'error': 'Could not understand your request. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Step 2 — Use parsed search_query to fetch songs from YouTube
        search_query = intent.get('search_query', user_text)
        songs        = search_youtube(search_query, max_results=20)

        # Step 3 — If specific song requested, limit to top 1
        if intent.get('is_specific_song'):
            songs = songs[:1]

        return Response({
            'intent':   intent,
            'songs':    songs,
            'query':    search_query,
            'message':  intent.get('greeting_response', 'Here is your music!'),
        })


class MoodSuggestView(APIView):
    """
    Given a mood directly, suggest a search query and return songs.
    Useful for quick mood-based buttons on frontend.
    """
    permission_classes = [IsAuthenticated]

    MOOD_QUERIES = {
        'happy':     'happy hindi songs upbeat bollywood',
        'sad':       'sad hindi songs emotional bollywood',
        'romantic':  'romantic hindi love songs',
        'energetic': 'high energy hindi dance songs',
        'calm':      'calm relaxing hindi songs peaceful',
        'party':     'party hindi songs dance floor hits',
        'focused':   'instrumental music for focus and study',
        'devotional':'hindi devotional songs bhakti',
        'angry':     'powerful hindi songs intense',
        'neutral':   'popular hindi songs latest hits',
    }

    def get(self, request):
        mood  = request.query_params.get('mood', 'neutral').lower()
        query = self.MOOD_QUERIES.get(mood, 'popular hindi songs')
        songs = search_youtube(query, max_results=20)

        return Response({
            'mood':  mood,
            'query': query,
            'songs': songs,
        })