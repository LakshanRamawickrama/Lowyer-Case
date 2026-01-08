from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    fullName = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    barNumber = models.CharField(max_length=100, null=True, blank=True)
    practiceAreas = models.TextField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.username
