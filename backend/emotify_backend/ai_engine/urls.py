from django.urls import path
from .views import ParseIntentView, MoodSuggestView

urlpatterns = [
    path('parse-intent/', ParseIntentView.as_view(), name='parse-intent'),
    path('mood/',         MoodSuggestView.as_view(), name='mood-suggest'),
]