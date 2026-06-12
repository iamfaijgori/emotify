from celery import shared_task
from .utils import send_email_otp, send_sms_otp


@shared_task
def send_email_otp_task(email, otp_code, purpose):
    send_email_otp(email, otp_code, purpose)


@shared_task
def send_sms_otp_task(phone_number, otp_code, purpose):
    send_sms_otp(phone_number, otp_code, purpose)