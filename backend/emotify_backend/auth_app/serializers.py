from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'phone_number', 'nickname', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.is_verified = False
        user.save()
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    purpose  = serializers.ChoiceField(choices=['register', 'password_reset', 'login'])


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email        = serializers.EmailField()
    otp_code     = serializers.CharField(max_length=6)
    new_password = serializers.CharField(validators=[validate_password])


class ResendOTPSerializer(serializers.Serializer):
    email   = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['register', 'password_reset', 'login'])


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])