import random
import string
from datetime import timedelta
from django.utils import timezone
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

    import requests as req
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept":       "application/json",
        "content-type": "application/json",
        "api-key":      settings.BREVO_API_KEY,
    }
    payload = {
        "sender":      {"name": "Emotify", "email": settings.EMAIL_HOST_USER},
        "to":          [{"email": email}],
        "subject":     f"Emotify — Your {label} OTP",
        "htmlContent": f"""
            <div style="font-family:Arial,sans-serif;padding:20px;max-width:400px;">
                <h2 style="color:#6C63FF;">Emotify 🎵</h2>
                <p>Hi there!</p>
                <p>Your OTP for <strong>{label}</strong> is:</p>
                <h1 style="color:#FF6584;letter-spacing:8px;font-size:36px;">{otp_code}</h1>
                <p>This OTP is valid for <strong>5 minutes</strong> only.</p>
                <p>Do not share this with anyone.</p>
                <br>
                <p style="color:#888;">— Team Emotify</p>
            </div>
        """
    }
    response = req.post(url, json=payload, headers=headers)
    if response.status_code not in (200, 201):
        print(f"Brevo error: {response.text}")
        raise Exception(f"Email send failed: {response.text}")

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