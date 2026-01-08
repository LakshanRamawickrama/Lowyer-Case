import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_main.settings')
django.setup()

try:
    print(f"Testing email with from_email: {settings.DEFAULT_FROM_EMAIL}")
    print(f"Recipient: {settings.EMAIL_HOST_USER}")
    send_mail(
        'Manual Test Email',
        'Verification from script.',
        settings.DEFAULT_FROM_EMAIL,
        [settings.EMAIL_HOST_USER],
        fail_silently=False,
    )
    print("Email sent successfully!")
except Exception as e:
    print(f"Failed to send email: {e}")
    import traceback
    traceback.print_exc()
