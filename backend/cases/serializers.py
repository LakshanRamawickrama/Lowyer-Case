from rest_framework import serializers
from .models import Case
from clients.serializers import ClientSerializer

class CaseSerializer(serializers.ModelSerializer):
    client = ClientSerializer(source='clientId', read_only=True)
    
    class Meta:
        model = Case
        fields = '__all__'
