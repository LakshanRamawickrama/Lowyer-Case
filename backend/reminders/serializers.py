from rest_framework import serializers
from .models import Reminder
from cases.serializers import CaseSerializer

class ReminderSerializer(serializers.ModelSerializer):
    case = CaseSerializer(source='caseId', read_only=True)
    
    class Meta:
        model = Reminder
        fields = '__all__'
