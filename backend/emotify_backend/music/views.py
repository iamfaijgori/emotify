from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import PlayHistory, Playlist, UserPreference
from .serializers import PlayHistorySerializer, PlaylistSerializer
from .youtube import search_youtube


class SearchMusicView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response(
                {'error': 'Query parameter q is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        results = search_youtube(query)

        return Response({
            'query':   query,
            'source':  'youtube',
            'results': results,
            'count':   len(results)
        })

class LogPlayView(APIView):
    """Log a song that was played"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        PlayHistory.objects.create(
            user       = request.user,
            song_title = data.get('song_title', ''),
            artist     = data.get('artist', ''),
            song_id    = data.get('song_id', ''),
            thumbnail  = data.get('thumbnail', ''),
            source     = data.get('source', 'youtube'),
            duration   = data.get('duration', ''),
        )
        return Response({'message': 'Play logged.'})


class PlayHistoryView(APIView):
    """Get user's listening history"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history    = PlayHistory.objects.filter(user=request.user)[:50]
        serializer = PlayHistorySerializer(history, many=True)
        return Response(serializer.data)


class PlaylistListCreateView(APIView):
    """List all playlists or create a new one"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        playlists  = Playlist.objects.filter(user=request.user)
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PlaylistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlaylistDetailView(APIView):
    """Get, update or delete a specific playlist"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Playlist.objects.get(pk=pk, user=user)
        except Playlist.DoesNotExist:
            return None

    def get(self, request, pk):
        playlist = self.get_object(pk, request.user)
        if not playlist:
            return Response({'error': 'Playlist not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PlaylistSerializer(playlist).data)

    def patch(self, request, pk):
        playlist = self.get_object(pk, request.user)
        if not playlist:
            return Response({'error': 'Playlist not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PlaylistSerializer(playlist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        playlist = self.get_object(pk, request.user)
        if not playlist:
            return Response({'error': 'Playlist not found'}, status=status.HTTP_404_NOT_FOUND)
        playlist.delete()
        return Response({'message': 'Playlist deleted.'})


class FavouritesView(APIView):
    """Add or remove a song from favourites"""
    permission_classes = [IsAuthenticated]

    def get_or_create_pref(self, user):
        pref, _ = UserPreference.objects.get_or_create(user=user)
        return pref

    def get(self, request):
        pref = self.get_or_create_pref(request.user)
        return Response({'favourites': pref.favourite_songs})

    def post(self, request):
        pref = self.get_or_create_pref(request.user)
        song = request.data.get('song')
        if not song:
            return Response({'error': 'Song data required'}, status=status.HTTP_400_BAD_REQUEST)

        favs = pref.favourite_songs
        # Avoid duplicates
        if not any(s.get('id') == song.get('id') for s in favs):
            favs.append(song)
            pref.favourite_songs = favs
            pref.save()

        return Response({'message': 'Added to favourites.'})

    def delete(self, request):
        pref    = self.get_or_create_pref(request.user)
        song_id = request.data.get('song_id')
        pref.favourite_songs = [s for s in pref.favourite_songs if s.get('id') != song_id]
        pref.save()
        return Response({'message': 'Removed from favourites.'})