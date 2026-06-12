import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email         = models.EmailField(unique=True)
    phone_number  = models.CharField(max_length=15, unique=True, null=True, blank=True)
    nickname      = models.CharField(max_length=50, blank=True)
    is_verified   = models.BooleanField(default=False)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']


class UserProfile(models.Model):
    LANGUAGE_CHOICES = [
        ('hindi',    'Hindi'),
        ('english',  'English'),
        ('punjabi',  'Punjabi'),
        ('tamil',    'Tamil'),
        ('telugu',   'Telugu'),
        ('bengali',  'Bengali'),
        ('marathi',  'Marathi'),
    ]

    GENRE_CHOICES = [
        ('bollywood',   'Bollywood'),
        ('pop',         'Pop'),
        ('rock',        'Rock'),
        ('classical',   'Classical'),
        ('jazz',        'Jazz'),
        ('hip_hop',     'Hip Hop'),
        ('devotional',  'Devotional'),
        ('romantic',    'Romantic'),
        ('party',       'Party'),
    ]

    user               = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar             = models.ImageField(upload_to='avatars/', null=True, blank=True)
    preferred_language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='hindi')
    preferred_genre    = models.CharField(max_length=20, choices=GENRE_CHOICES, default='bollywood')
    date_of_birth      = models.DateField(null=True, blank=True)
    bio                = models.TextField(blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} — profile"

    class Meta:
        db_table = 'user_profiles'