from rest_framework import serializers
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserProfile
        fields = [
            'avatar',
            'preferred_language',
            'preferred_genre',
            'date_of_birth',
            'bio',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            'id',
            'email',
            'phone_number',
            'nickname',
            'is_verified',
            'created_at',
            'profile',
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']


class UpdateProfileSerializer(serializers.ModelSerializer):
    preferred_language = serializers.CharField(source='profile.preferred_language', required=False)
    preferred_genre    = serializers.CharField(source='profile.preferred_genre', required=False)
    avatar             = serializers.ImageField(source='profile.avatar', required=False)
    bio                = serializers.CharField(source='profile.bio', required=False)

    class Meta:
        model  = User
        fields = ['nickname', 'phone_number', 'preferred_language', 'preferred_genre', 'avatar', 'bio']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})

        # Update user fields
        instance.nickname     = validated_data.get('nickname', instance.nickname)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.save()

        # Update profile fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance