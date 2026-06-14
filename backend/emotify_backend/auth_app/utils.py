import random
import string
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from twilio.rest import Client
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

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

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email}],
        sender={"name": "Emotify", "email": settings.EMAIL_HOST_USER},
        subject=f"Emotify — Your {label} OTP",
        html_content=f"""
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #6C63FF;">Emotify</h2>
                <p>Hi there!</p>
                <p>Your OTP for <strong>{label}</strong> is:</p>
                <h1 style="color: #FF6584; letter-spacing: 4px;">{otp_code}</h1>
                <p>This OTP is valid for 5 minutes only.</p>
                <p>Do not share this with anyone.</p>
                <br>
                <p>— Team Emotify</p>
            </div>
        """
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        print(f"Brevo email error: {e}")
        raise

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