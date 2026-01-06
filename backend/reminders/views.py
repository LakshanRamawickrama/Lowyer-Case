from rest_framework import viewsets
from .models import Reminder
from .serializers import ReminderSerializer

class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all().order_by('dueDate')
    serializer_class = ReminderSerializer
