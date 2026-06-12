from django.contrib import admin
from .models import OTPRecord


@admin.register(OTPRecord)
class OTPRecordAdmin(admin.ModelAdmin):
    list_display  = ['user', 'purpose', 'otp_code', 'is_used', 'expires_at', 'created_at']
    list_filter   = ['purpose', 'is_used']
    search_fields = ['user__email']
    ordering      = ['-created_at']