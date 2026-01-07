from django.contrib import admin
from .models import Case, CaseType

@admin.register(CaseType)
class CaseTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'caseNumber', 'caseType', 'clientId', 'status', 'priority', 'createdAt')
    search_fields = ('title', 'caseNumber')
    list_filter = ('status', 'priority', 'caseType')
