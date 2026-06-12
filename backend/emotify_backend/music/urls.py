from django.urls import path
from .views import (
    SearchMusicView, LogPlayView, PlayHistoryView,
    PlaylistListCreateView, PlaylistDetailView, FavouritesView
)

urlpatterns = [
    path('search/',              SearchMusicView.as_view(),       name='music-search'),
    path('log/',                 LogPlayView.as_view(),           name='log-play'),
    path('history/',             PlayHistoryView.as_view(),       name='play-history'),
    path('playlists/',           PlaylistListCreateView.as_view(), name='playlists'),
    path('playlists/<uuid:pk>/', PlaylistDetailView.as_view(),    name='playlist-detail'),
    path('favourites/',          FavouritesView.as_view(),        name='favourites'),
]