from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines             = [UserProfileInline]
    list_display        = ['email', 'nickname', 'is_verified', 'is_active', 'created_at']
    list_filter         = ['is_verified', 'is_active', 'is_staff']
    search_fields       = ['email', 'nickname', 'phone_number']
    ordering            = ['-created_at']
    fieldsets           = (
        (None,           {'fields': ('email', 'password')}),
        ('Personal',     {'fields': ('nickname', 'phone_number')}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'password1', 'password2'),
        }),
    )