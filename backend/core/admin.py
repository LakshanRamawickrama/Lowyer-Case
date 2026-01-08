from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SystemSettings

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('fullName', 'phone', 'barNumber', 'practiceAreas')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('fullName', 'phone', 'barNumber', 'practiceAreas')}),
    )
    list_display = ['username', 'email', 'fullName', 'is_staff']

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['adminEmail']
    
    def has_add_permission(self, request):
        if self.model.objects.count() >= 1:
            return False
        return super().has_add_permission(request)
    
    def has_delete_permission(self, request, obj=None):
        return False
