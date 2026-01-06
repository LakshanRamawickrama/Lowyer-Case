from django.contrib import admin
from .models import Reminder

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'dueDate', 'caseId', 'completed', 'priority')
    search_fields = ('title',)
    list_filter = ('completed', 'priority', 'type')
    date_hierarchy = 'dueDate'
