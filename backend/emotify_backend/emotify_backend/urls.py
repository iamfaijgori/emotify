from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'message': 'Emotify backend is running'})


urlpatterns = [
    path('admin/',       admin.site.urls),
    path('health/',      health_check,              name='health-check'),
    path('api/users/',   include('users.urls')),
    path('api/auth/',    include('auth_app.urls')),
    path('api/music/',   include('music.urls')),
    path('api/ai/',      include('ai_engine.urls')),
]