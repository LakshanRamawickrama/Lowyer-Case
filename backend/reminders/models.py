from django.db import models
from cases.models import Case

class Reminder(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    dueDate = models.DateTimeField()
    location = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=50, default="general")
    priority = models.CharField(max_length=50, default="medium")
    completed = models.BooleanField(default=False)
    caseId = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="reminders", null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.dueDate})"
