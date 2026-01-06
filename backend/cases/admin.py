from django.contrib import admin
from .models import Case

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'caseNumber', 'clientId', 'status', 'priority', 'createdAt')
    search_fields = ('title', 'caseNumber')
    list_filter = ('status', 'priority', 'type')
