import uuid
from django.db import models
from users.models import User


class OTPRecord(models.Model):
    PURPOSE_CHOICES = [
        ('register',       'Register'),
        ('password_reset', 'Password Reset'),
        ('login',          'Login'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp_code   = models.CharField(max_length=6)
    purpose    = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_used    = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} — {self.purpose} — {self.otp_code}"

    class Meta:
        db_table = 'otp_records'
        ordering = ['-created_at']