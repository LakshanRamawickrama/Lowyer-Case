from rest_framework import serializers
from .models import Case, CaseDocument
from clients.serializers import ClientSerializer

class CaseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseDocument
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    client = ClientSerializer(source='clientId', read_only=True)
    documents = CaseDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Case
        fields = '__all__'
