import uuid
from django.db import models
from users.models import User


class PlayHistory(models.Model):
    SOURCE_CHOICES = [
        ('youtube',  'YouTube'),
        ('jiosaavn', 'JioSaavn'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='play_history')
    song_title  = models.CharField(max_length=255)
    artist      = models.CharField(max_length=255, blank=True)
    song_id     = models.CharField(max_length=255)  # YouTube video ID or JioSaavn song ID
    thumbnail   = models.URLField(blank=True)
    source      = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    duration    = models.CharField(max_length=20, blank=True)
    played_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.nickname} → {self.song_title}"

    class Meta:
        db_table = 'play_history'
        ordering = ['-played_at']


class Playlist(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    name       = models.CharField(max_length=100)
    songs      = models.JSONField(default=list)   # list of song dicts
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.nickname} — {self.name}"

    class Meta:
        db_table = 'playlists'
        ordering = ['-created_at']


class UserPreference(models.Model):
    user             = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preference')
    favourite_songs  = models.JSONField(default=list)
    blocked_songs    = models.JSONField(default=list)
    mood_history     = models.JSONField(default=list)   # stores last 10 moods with timestamps
    updated_at       = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.nickname} — preferences"

    class Meta:
        db_table = 'user_preferences'