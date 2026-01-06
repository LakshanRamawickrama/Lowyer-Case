import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_main.settings')
django.setup()

from core.models import User
from clients.models import Client
from cases.models import Case
from reminders.models import Reminder
from django.utils import timezone
from datetime import timedelta

def seed():
    # Create demo user
    if not User.objects.filter(username="demo_lawyer").exists():
        demo_user = User.objects.create_user(
            username="demo_lawyer",
            password="demo123",
            fullName="Demo Lawyer",
            email="demo@legalflow.com",
            phone="+1 (555) 123-4567",
            barNumber="BAR123456789",
            practiceAreas="Personal Injury, Corporate Law, Estate Planning"
        )
        print("✅ Demo user created")

    # Create sample clients
    clients_data = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@email.com",
            "phone": "+1 (555) 123-4567",
            "address": "123 Main St, City, State 12345",
            "status": "active"
        },
        {
            "name": "Robert Miller",
            "email": "robert.miller@email.com",
            "phone": "+1 (555) 987-6543",
            "address": "456 Oak Ave, City, State 12345",
            "status": "active"
        },
        {
            "name": "TechCorp Ltd.",
            "email": "contact@techcorp.com",
            "phone": "+1 (555) 456-7890",
            "address": "789 Business Blvd, City, State 12345",
            "status": "active"
        }
    ]

    created_clients = []
    for data in clients_data:
        client, created = Client.objects.get_or_create(name=data["name"], defaults=data)
        created_clients.append(client)
        if created:
            print(f"✅ Client {client.name} created")

    # Create sample cases
    cases_data = [
        {
            "title": "Personal Injury Claim",
            "caseNumber": "PI-2024-001",
            "type": "Personal Injury",
            "status": "active",
            "priority": "high",
            "description": "Slip and fall incident at local grocery store",
            "clientId": created_clients[0]
        },
        {
            "title": "Corporate Contract Review",
            "caseNumber": "CR-2024-002",
            "type": "Corporate Law",
            "status": "active",
            "priority": "medium",
            "description": "Review and negotiation of service agreement",
            "clientId": created_clients[2]
        },
        {
            "title": "Estate Planning",
            "caseNumber": "EP-2024-003",
            "type": "Estate Planning",
            "status": "pending",
            "priority": "low",
            "description": "Will and trust preparation",
            "clientId": created_clients[1]
        }
    ]

    created_cases = []
    for data in cases_data:
        case, created = Case.objects.get_or_create(caseNumber=data["caseNumber"], defaults=data)
        created_cases.append(case)
        if created:
            print(f"✅ Case {case.title} created")

    # Create sample reminders
    reminders_data = [
        {
            "title": "Court Hearing",
            "description": "Personal injury case hearing",
            "dueDate": timezone.now() + timedelta(days=7),
            "location": "Courthouse Room 101",
            "type": "hearing",
            "priority": "high",
            "caseId": created_cases[0]
        },
        {
            "title": "Client Meeting",
            "description": "Contract review meeting with client",
            "dueDate": timezone.now() + timedelta(days=3),
            "type": "meeting",
            "priority": "medium",
            "caseId": created_cases[1]
        },
        {
            "title": "Document Deadline",
            "description": "Submit estate planning documents",
            "dueDate": timezone.now() + timedelta(days=14),
            "type": "deadline",
            "priority": "medium",
            "caseId": created_cases[2]
        }
    ]

    for data in reminders_data:
        reminder, created = Reminder.objects.get_or_create(title=data["title"], defaults=data)
        if created:
            print(f"✅ Reminder {reminder.title} created")

if __name__ == "__main__":
    seed()
    print("🚀 Database seeding complete!")
