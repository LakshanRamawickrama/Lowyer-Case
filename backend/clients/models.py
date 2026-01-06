from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default="active")
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
