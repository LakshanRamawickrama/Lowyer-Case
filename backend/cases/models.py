from django.db import models
from clients.models import Client

class Case(models.Model):
    title = models.CharField(max_length=255)
    caseNumber = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="active")
    priority = models.CharField(max_length=50, default="medium")
    description = models.TextField(null=True, blank=True)
    clientId = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="cases", null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.caseNumber} - {self.title}" if self.caseNumber else self.title
