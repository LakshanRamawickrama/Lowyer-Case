from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from clients.views import ClientViewSet
from cases.views import CaseViewSet, CaseDocumentViewSet, CaseTypeViewSet
from reminders.views import ReminderViewSet
from core.views import UserViewSet, DashboardStatsView, LoginView, UpdateProfileView, LogoutView, MeView, SendTestEmailView

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', UserViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'cases', CaseViewSet)
router.register(r'case-types', CaseTypeViewSet)
router.register(r'case-documents', CaseDocumentViewSet)
router.register(r'reminders', ReminderViewSet)

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # Extra compatibility routes
    path('api/dashboard/stats', DashboardStatsView.as_view()),
    path('api/auth/login', LoginView.as_view()),
    path('api/auth/logout', LogoutView.as_view()),
    path('api/auth/me', MeView.as_view()),
    path('api/user/<int:pk>', UpdateProfileView.as_view()),
    path('api/test-email', SendTestEmailView.as_view(), name='test-email'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

