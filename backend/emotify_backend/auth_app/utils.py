import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client


def generate_otp(length=6):
    """Generate a secure 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=length))


def send_email_otp(email, otp_code, purpose):
    purpose_labels = {
        'register':       'Email Verification',
        'password_reset': 'Password Reset',
        'login':          'Login Verification',
    }
    label = purpose_labels.get(purpose, 'Verification')

    subject = f"Emotify — Your {label} OTP"
    message = f"""
Hi there!

Your Emotify OTP for {label} is:

    {otp_code}

This OTP is valid for 5 minutes only.
Do not share this with anyone.

— Team Emotify
    """
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )


def send_sms_otp(phone_number, otp_code, purpose):
    purpose_labels = {
        'register':       'Email Verification',
        'password_reset': 'Password Reset',
        'login':          'Login Verification',
    }
    label = purpose_labels.get(purpose, 'Verification')

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your Emotify {label} OTP is: {otp_code}. Valid for 5 minutes. Do not share.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone_number
    )


def create_otp_record(user, purpose):
    """Create OTP record in DB and return the code"""
    from .models import OTPRecord

    # Expire any previous unused OTPs for same user + purpose
    OTPRecord.objects.filter(
        user=user,
        purpose=purpose,
        is_used=False
    ).update(is_used=True)

    otp_code   = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=5)

    OTPRecord.objects.create(
        user       = user,
        otp_code   = otp_code,
        purpose    = purpose,
        expires_at = expires_at
    )
    return otp_code


def verify_otp_code(user, otp_code, purpose):
    """Returns True if OTP is valid, False otherwise"""
    from .models import OTPRecord

    try:
        record = OTPRecord.objects.get(
            user     = user,
            otp_code = otp_code,
            purpose  = purpose,
            is_used  = False
        )
    except OTPRecord.DoesNotExist:
        return False, "Invalid OTP"

    if timezone.now() > record.expires_at:
        return False, "OTP has expired"

    record.is_used = True
    record.save()
    return True, "OTP verified"