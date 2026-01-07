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
    nic = models.CharField(max_length=20, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.caseNumber:
            from django.utils import timezone
            year = timezone.now().year
            
            # Get type code (First letters of each word)
            type_code = "".join([word[0].upper() for word in self.type.split()])
            
            # Count existing cases of same type in same year
            count = Case.objects.filter(
                type=self.type,
                createdAt__year=year
            ).count()
            
            # Fallback if createdAt isn't set yet (for new records before save)
            if count == 0:
                from django.db.models import Q
                count = Case.objects.filter(type=self.type).filter(
                    Q(caseNumber__contains=f"/{year}/")
                ).count()

            self.caseNumber = f"{type_code}/{year}/{(count + 1):03d}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.caseNumber} - {self.title}" if self.caseNumber else self.title

class CaseDocument(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="case_documents/")
    title = models.CharField(max_length=255)
    uploadedAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.case.caseNumber})"
