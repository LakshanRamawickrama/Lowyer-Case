from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from clients.views import ClientViewSet
from cases.views import CaseViewSet
from reminders.views import ReminderViewSet
from core.views import UserViewSet, DashboardStatsView, LoginView, UpdateProfileView, LogoutView, MeView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'cases', CaseViewSet)
router.register(r'reminders', ReminderViewSet)

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
]
