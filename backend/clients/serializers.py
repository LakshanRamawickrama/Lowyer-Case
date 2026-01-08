from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    cases = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_cases(self, obj):
        cases = []
        for case in obj.cases.all():
            cases.append({
                'id': case.id,
                'title': case.title,
                'caseNumber': case.caseNumber,
                'documentCount': case.documents.count(),
                'reminderCount': case.reminders.count()
            })
        return cases
