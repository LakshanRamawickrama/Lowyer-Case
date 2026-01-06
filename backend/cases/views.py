from rest_framework import viewsets
from .models import Case
from .serializers import CaseSerializer

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all().order_by('-createdAt')
    serializer_class = CaseSerializer
    
    def get_queryset(self):
        queryset = Case.objects.all().order_by('-createdAt')
        client_id = self.request.query_params.get('clientId', None)
        if client_id is not None:
            queryset = queryset.filter(clientId=client_id)
        return queryset
