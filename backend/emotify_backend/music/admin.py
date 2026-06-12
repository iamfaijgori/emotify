from django.contrib import admin
from .models import PlayHistory, Playlist, UserPreference


@admin.register(PlayHistory)
class PlayHistoryAdmin(admin.ModelAdmin):
    list_display  = ['user', 'song_title', 'artist', 'source', 'played_at']
    list_filter   = ['source']
    search_fields = ['song_title', 'artist', 'user__email']


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display  = ['user', 'name', 'created_at']
    search_fields = ['name', 'user__email']


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display  = ['user', 'updated_at']
    search_fields = ['user__email']