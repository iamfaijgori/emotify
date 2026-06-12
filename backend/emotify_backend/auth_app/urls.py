from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, VerifyOTPView, LoginView,
    ForgotPasswordView, ResetPasswordView,
    ResendOTPView, ChangePasswordView, LogoutView
)

urlpatterns = [
    path('register/',         RegisterView.as_view(),        name='register'),
    path('verify-otp/',       VerifyOTPView.as_view(),        name='verify-otp'),
    path('login/',            LoginView.as_view(),            name='login'),
    path('token/refresh/',    TokenRefreshView.as_view(),     name='token-refresh'),
    path('forgot-password/',  ForgotPasswordView.as_view(),   name='forgot-password'),
    path('reset-password/',   ResetPasswordView.as_view(),    name='reset-password'),
    path('resend-otp/',       ResendOTPView.as_view(),        name='resend-otp'),
    path('change-password/',  ChangePasswordView.as_view(),   name='change-password'),
    path('logout/',           LogoutView.as_view(),           name='logout'),
]