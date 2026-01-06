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
    print("🧹 Clearing existing data...")
    Reminder.objects.all().delete()
    Case.objects.all().delete()
    Client.objects.all().delete()
    
    # Create or update professional Sri Lankan lawyer profile
    demo_user, created = User.objects.get_or_create(
        username="demo_lawyer",
        defaults={
            "fullName": "Lakshan Wickramasinghe, Esq.",
            "email": "l.wickramasinghe@colombolaw.lk",
            "phone": "+94 11 234 5678",
            "barNumber": "SL-BAR-2015-882",
            "practiceAreas": "Land Litigation, Fundamental Rights, Commercial Law"
        }
    )
    if not created:
        demo_user.fullName = "Lakshan Wickramasinghe, Esq."
        demo_user.email = "l.wickramasinghe@colombolaw.lk"
        demo_user.barNumber = "SL-BAR-2015-882"
        demo_user.save()
    demo_user.set_password("demo123")
    demo_user.save()
    print("✅ Sri Lankan Senior Counsel profile established")

    # Real-feeling Sri Lankan Clients
    clients_data = [
        {"name": "Dialog Axiata PLC (Legal Div)", "email": "legal@dialog.lk", "phone": "+94 11 777 8888", "address": "475, Union Place, Colombo 02", "status": "active"},
        {"name": "Mr. Aruna Perera", "email": "aruna.p@gmail.com", "phone": "+94 77 123 4567", "address": "No. 45, Peradeniya Road, Kandy", "status": "active"},
        {"name": "Ceylon Tea Exporters Ltd", "email": "info@ceylontea.lk", "phone": "+94 11 444 5555", "address": "Marine Drive, Colombo 03", "status": "active"},
        {"name": "Mrs. Sunethra Ratnayake", "email": "sunethra.r@outlook.com", "phone": "+94 71 987 6543", "address": "Lotus Grove, Dehiwala", "status": "active"},
        {"name": "Hemas Holdings PLC", "email": "compliance@hemas.com", "phone": "+94 11 231 3131", "address": "Hemas House, Colombo 02", "status": "active"},
        {"name": "Galle Face Hotel Group", "email": "gm.legal@gallefacehotel.com", "phone": "+94 11 254 1010", "address": "02 Galle Road, Colombo 03", "status": "active"},
    ]

    created_clients = []
    for data in clients_data:
        client = Client.objects.create(**data)
        created_clients.append(client)
    print(f"✅ Created {len(created_clients)} local strategic clients")

    # Real-feeling Sri Lankan Cases
    cases_data = [
        {
            "title": "Land Partition Case - Nuwara Eliya",
            "caseNumber": "LP/2024/NE/102",
            "type": "Civil Law",
            "status": "active",
            "priority": "high",
            "description": "Partition action for a tea estate property in Nuwara Eliya district. Title report currently under review.",
            "clientId": created_clients[1]
        },
        {
            "title": "Fundamental Rights Petition (SC)",
            "caseNumber": "SC/FR/2024/45",
            "type": "Fundamental Rights",
            "status": "active",
            "priority": "urgent",
            "description": "Petition filed in the Supreme Court regarding illegal detention under PTA. Support hearing scheduled.",
            "clientId": created_clients[3]
        },
        {
            "title": "Spectrum Licensing Arbitration",
            "caseNumber": "ARB/COL/2024/11",
            "type": "Commercial Law",
            "status": "active",
            "priority": "medium",
            "description": "Arbitration proceedings regarding TRCSL spectrum allocation and usage fees.",
            "clientId": created_clients[0]
        },
        {
            "title": "Hemas Trade Mark Infringement",
            "caseNumber": "CHC/IP/2024/09",
            "type": "Civil Law",
            "status": "pending",
            "priority": "high",
            "description": "Commercial High Court case regarding intellectual property infringement of personal care brands.",
            "clientId": created_clients[4]
        },
        {
            "title": "Galle Face Hotel Lease Renewal",
            "caseNumber": "LR/2024/005",
            "type": "Land Law",
            "status": "review",
            "priority": "medium",
            "description": "Long-term land lease renewal review with UDA for seafront property expansion.",
            "clientId": created_clients[5]
        },
    ]

    created_cases = []
    for data in cases_data:
        case = Case.objects.create(**data)
        created_cases.append(case)
    print(f"✅ Established {len(created_cases)} local legal cases")

    # Real-feeling Sri Lankan Reminders
    now = timezone.now()
    reminders_data = [
        {"title": "Supreme Court Support Hearing", "description": "Support of the FR petition for Mrs. Ratnayake at Court No. 502.", "dueDate": now + timedelta(days=2, hours=10), "location": "Supreme Court Complex, Colombo 12", "type": "hearing", "priority": "urgent", "caseId": created_cases[1]},
        {"title": "Arbitration Meeting - Dialog", "description": "Consultation with Queen's Counsel regarding arbitration strategy.", "dueDate": now + timedelta(days=4, hours=14), "location": "Hulftsdorp Chambers", "type": "meeting", "priority": "high", "caseId": created_cases[2]},
        {"title": "Land Deed Verification - Kandy", "description": "Verify original deeds at the Kandy Land Registry.", "dueDate": now + timedelta(days=1, hours=9), "location": "Land Registry, Kandy", "type": "filing", "priority": "medium", "caseId": created_cases[0]},
        {"title": "Client Consultation: Hemas", "description": "Discuss IP infringement evidence with Hemas legal team.", "dueDate": now + timedelta(days=7), "location": "Hemas House Boardroom", "type": "meeting", "priority": "medium", "caseId": created_cases[3]},
        {"title": "UDA Proposal Submission", "description": "Submit final lease renewal proposal for Galle Face expansion.", "dueDate": now + timedelta(days=5, hours=11), "location": "UDA Head Office, Battaramulla", "type": "filing", "priority": "high", "caseId": created_cases[4]},
        {"title": "Court Appearance: District Court", "description": "Calling on trial date for Land Case LP/102.", "dueDate": now + timedelta(days=14), "location": "District Court Nuwara Eliya", "type": "hearing", "priority": "low", "caseId": created_cases[0]},
    ]

    for data in reminders_data:
        Reminder.objects.create(**data)
    print(f"✅ Scheduled {len(reminders_data)} critical legal actions")

if __name__ == "__main__":
    seed()
    print("\n🚀 Sri Lankan legal database established successfully!")
