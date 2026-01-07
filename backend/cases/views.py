from rest_framework import viewsets, permissions
from .models import Case, CaseDocument, CaseType
from .serializers import CaseSerializer, CaseDocumentSerializer, CaseTypeSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check for development

class CaseTypeViewSet(viewsets.ModelViewSet):
    queryset = CaseType.objects.all().order_by('name')
    serializer_class = CaseTypeSerializer
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all().order_by('-createdAt')
    serializer_class = CaseSerializer
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Case.objects.all().order_by('-createdAt')
        client_id = self.request.query_params.get('clientId', None)
        if client_id is not None:
            queryset = queryset.filter(clientId=client_id)
        return queryset

class CaseDocumentViewSet(viewsets.ModelViewSet):
    queryset = CaseDocument.objects.all().order_by('-uploadedAt')
    serializer_class = CaseDocumentSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]
