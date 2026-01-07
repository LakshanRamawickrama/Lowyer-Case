from rest_framework import viewsets, permissions
from .models import Reminder
from .serializers import ReminderSerializer
from cases.views import CsrfExemptSessionAuthentication

class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all().order_by('dueDate')
    serializer_class = ReminderSerializer
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]
