import requests
from django.conf import settings


YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEO_URL  = "https://www.googleapis.com/youtube/v3/videos"


def search_youtube(query, max_results=20):
    """Search YouTube and return list of songs"""
    params = {
        'part':       'snippet',
        'q':          query,
        'type':       'video',
        'videoCategoryId': '10',   # Music category
        'maxResults': max_results,
        'key':        settings.YOUTUBE_API_KEY,
    }

    response = requests.get(YOUTUBE_SEARCH_URL, params=params)
    data     = response.json()

    if 'error' in data:
        return []

    songs = []
    for item in data.get('items', []):
        snippet = item['snippet']
        songs.append({
            'id':        item['id']['videoId'],
            'title':     snippet['title'],
            'artist':    snippet['channelTitle'],
            'thumbnail': snippet['thumbnails']['high']['url'],
            'source':    'youtube',
            'url':       f"https://www.youtube.com/watch?v={item['id']['videoId']}",
        })

    return songs


def get_video_duration(video_id):
    """Get duration of a YouTube video"""
    params = {
        'part': 'contentDetails',
        'id':   video_id,
        'key':  settings.YOUTUBE_API_KEY,
    }
    response = requests.get(YOUTUBE_VIDEO_URL, params=params)
    data     = response.json()

    items = data.get('items', [])
    if items:
        return items[0]['contentDetails']['duration']  # ISO 8601 format
    return ''