from rest_framework import viewsets, views, permissions
from rest_framework.response import Response
from .models import User, SystemSettings
from .serializers import UserSerializer, SystemSettingsSerializer
from clients.models import Client
from cases.models import Case
from reminders.models import Reminder
from django.utils import timezone
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check for development

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response({'user': serializer.data})
            
        return Response({'message': 'Invalid credentials'}, status=401)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

class MeView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response({'user': serializer.data})
        return Response({'user': None}, status=401)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateProfileView(views.APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                user = serializer.save()
                
                if user.email:
                    try:
                        send_mail(
                            'Profile Updated - Case Management System',
                            f'Hello {user.fullName or user.username},\n\nYour profile has been successfully updated.',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=True,
                        )
                    except Exception:
                        pass

                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=404)
        except Exception as e:
            return Response({'message': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class SendTestEmailView(views.APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'message': 'Email is required'}, status=400)
        
        try:
            send_mail(
                'Test Email - Case Management System',
                'This is a test email to verify your SMTP configuration is working correctly.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Test email sent successfully'})
        except Exception as e:
            return Response({'message': f'Failed to send email: {str(e)}'}, status=500)

class SystemSettingsView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = (CsrfExemptSessionAuthentication,)
    def get(self, request):
        settings_obj = SystemSettings.objects.first()
        if not settings_obj:
            settings_obj = SystemSettings.objects.create(adminEmail="admin@gmail.com")
        serializer = SystemSettingsSerializer(settings_obj)
        return Response(serializer.data)

class DashboardStatsView(views.APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        total_cases = Case.objects.count()
        active_cases = Case.objects.filter(status__iexact='active').count()
        total_clients = Client.objects.count()
        pending_reminders = Reminder.objects.filter(completed=False).count()
        
        return Response({
            'totalCases': total_cases,
            'activeCases': active_cases,
            'totalClients': total_clients,
            'pendingReminders': pending_reminders
        })
