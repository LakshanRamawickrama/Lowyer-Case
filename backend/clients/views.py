from rest_framework import viewsets, permissions
from .models import Client
from .serializers import ClientSerializer
from cases.views import CsrfExemptSessionAuthentication

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-createdAt')
    serializer_class = ClientSerializer
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        # Explicitly delete all cases associated with this client
        # This will also trigger cascading deletes for CaseDocuments and Reminders
        instance.cases.all().delete()
        instance.delete()
