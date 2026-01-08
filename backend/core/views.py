from rest_framework import viewsets, views
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer
from clients.models import Client
from cases.models import Case
from reminders.models import Reminder
from django.utils import timezone

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(views.APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print(f"DEBUG: Login body: {request.body}")
        username = request.data.get('username')
        password = request.data.get('password')
        print(f"DEBUG: Login attempt for user: {username}")
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            print(f"DEBUG: Authentication successful for: {username}")
            login(request, user)
            serializer = UserSerializer(user)
            return Response({'user': serializer.data})
            
        print(f"DEBUG: Authentication failed for: {username}")
        return Response({'message': 'Invalid credentials'}, status=401)

class LogoutView(views.APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

class MeView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        print(f"DEBUG: MeView check. User: {request.user}, Authenticated: {request.user.is_authenticated}")
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response({'user': serializer.data})
        return Response({'user': None}, status=401)

class UpdateProfileView(views.APIView):
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=404)

class DashboardStatsView(views.APIView):
    def get(self, request):
        total_cases = Case.objects.count()
        # Case-insensitive check for active status
        active_cases = Case.objects.filter(status__iexact='active').count()
        total_clients = Client.objects.count()
        # Pending reminders are those not completed (including overdue ones)
        pending_reminders = Reminder.objects.filter(completed=False).count()
        
        return Response({
            'totalCases': total_cases,
            'activeCases': active_cases,
            'totalClients': total_clients,
            'pendingReminders': pending_reminders
        })
