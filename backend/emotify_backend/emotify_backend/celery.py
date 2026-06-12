import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emotify_backend.settings')

app = Celery('emotify_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()