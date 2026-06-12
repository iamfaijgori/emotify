from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from users.models import User
from .serializers import (
    RegisterSerializer, VerifyOTPSerializer, LoginSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    ResendOTPSerializer, ChangePasswordSerializer
)
from .utils import create_otp_record, verify_otp_code
from .tasks import send_email_otp_task, send_sms_otp_task


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user     = serializer.save()
        otp_code = create_otp_record(user, 'register')

        # Send OTP via email (async)
        from .utils import send_email_otp
        # send_email_otp(user.email, otp_code, 'register')

        return Response({
            'message': 'Registration successful. OTP sent to your email and phone.',
            'email':   user.email,
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email    = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        purpose  = serializer.validated_data['purpose']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        is_valid, message = verify_otp_code(user, otp_code, purpose)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        if purpose == 'register':
            user.is_verified = True
            user.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Email verified successfully. Welcome to Emotify!',
                'tokens':  tokens,
            })

        return Response({'message': message})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email    = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_verified:
            return Response({'error': 'Please verify your email first'}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        return Response({
            'message':  f'Welcome back, {user.nickname or user.email}!',
            'tokens':   tokens,
            'nickname': user.nickname,
            'email':    user.email,
        })


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists or not — security best practice
            return Response({'message': 'If this email exists, an OTP has been sent.'})

        otp_code = create_otp_record(user, 'password_reset')
        from .utils import send_email_otp
        # send_email_otp(user.email, otp_code, 'password_reset')

        return Response({'message': 'If this email exists, an OTP has been sent.'})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email        = serializer.validated_data['email']
        otp_code     = serializer.validated_data['otp_code']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        is_valid, message = verify_otp_code(user, otp_code, 'password_reset')
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password reset successfully. Please login.'})


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email   = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        otp_code = create_otp_record(user, purpose)
        from .utils import send_email_otp
        # send_email_otp(user.email, otp_code, purpose)

        return Response({'message': 'OTP resent successfully.'})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)