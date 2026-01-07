from rest_framework import serializers
from .models import Case, CaseDocument, CaseType
from clients.serializers import ClientSerializer

class CaseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseType
        fields = '__all__'

class CaseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseDocument
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    client = ClientSerializer(source='clientId', read_only=True)
    documents = CaseDocumentSerializer(many=True, read_only=True)
    type_details = CaseTypeSerializer(source='caseType', read_only=True)
    reminders = serializers.SerializerMethodField()
    
    class Meta:
        model = Case
        fields = '__all__'

    def get_reminders(self, obj):
        return list(obj.reminders.all().values('id', 'title', 'dueDate'))
