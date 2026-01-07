from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    cases = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_cases(self, obj):
        # Using .values() to get a list of dicts with only necessary info
        return list(obj.cases.all().values('id', 'title', 'caseNumber'))
