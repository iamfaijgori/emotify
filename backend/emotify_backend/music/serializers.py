from rest_framework import serializers
from .models import PlayHistory, Playlist


class PlayHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = PlayHistory
        fields = [
            'id', 'song_title', 'artist',
            'song_id', 'thumbnail', 'source',
            'duration', 'played_at'
        ]


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Playlist
        fields = ['id', 'name', 'songs', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']