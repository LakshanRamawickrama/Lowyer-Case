from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('fullName', 'phone', 'barNumber', 'practiceAreas')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('fullName', 'phone', 'barNumber', 'practiceAreas')}),
    )
    list_display = ['username', 'email', 'fullName', 'is_staff']
