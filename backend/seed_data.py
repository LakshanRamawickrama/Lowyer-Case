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
    
    # Create or update professional demo user
    demo_user, created = User.objects.get_or_create(
        username="demo_lawyer",
        defaults={
            "fullName": "Alexander Vance, Esq.",
            "email": "a.vance@vancelaw.com",
            "phone": "+1 (212) 555-0198",
            "barNumber": "NY-772841",
            "practiceAreas": "Corporate Litigation, Intellectual Property, White Collar Defense"
        }
    )
    if not created:
        demo_user.fullName = "Alexander Vance, Esq."
        demo_user.email = "a.vance@vancelaw.com"
        demo_user.barNumber = "NY-772841"
        demo_user.save()
    demo_user.set_password("demo123")
    demo_user.save()
    print("✅ Professional lawyer profile established")

    # Real-feeling Clients
    clients_data = [
        {"name": "Global Logistics Systems Inc.", "email": "legal@globallogistics.com", "phone": "+1 (800) 555-9000", "address": "1200 Commerce Dr, Suite 500, Chicago, IL", "status": "active"},
        {"name": "Dr. Elizabeth Thorne", "email": "ethorne.md@healthmail.org", "phone": "+1 (312) 555-4421", "address": "88 Medical Plaza, Lakeview, IL", "status": "active"},
        {"name": "NexaStream Media Group", "email": "ops@nexastream.net", "phone": "+1 (212) 555-6677", "address": "42 Times Square Tower, New York, NY", "status": "active"},
        {"name": "Marcus & Elena Santoro", "email": "the.santoros@familymail.com", "phone": "+1 (708) 555-2231", "address": "452 Winnetka Ave, Winnetka, IL", "status": "active"},
        {"name": "Beacon Hill Estates Development", "email": "compliance@beaconhill.com", "phone": "+1 (617) 555-8812", "address": "15 State St, Boston, MA", "status": "active"},
        {"name": "Jonathan Sterling", "email": "j.sterling@sterlingfunds.com", "phone": "+1 (203) 555-9988", "address": "9 Greenwich Way, Greenwich, CT", "status": "active"},
        {"name": "Riverside Community Hospital", "email": "legal-office@riversidemed.org", "phone": "+1 (312) 555-0010", "address": "500 Wellness Parkway, Chicago, IL", "status": "active"},
        {"name": "Horizon Venture Partners", "email": "deals@horizonvp.com", "phone": "+1 (650) 555-4400", "address": "300 Sand Hill Rd, Menlo Park, CA", "status": "active"},
    ]

    created_clients = []
    for data in clients_data:
        client = Client.objects.create(**data)
        created_clients.append(client)
    print(f"✅ Created {len(created_clients)} strategic clients")

    # Real-feeling Cases
    cases_data = [
        {
            "title": "Cross-Border Acquisition Strategy",
            "caseNumber": "M&A-2024-88A",
            "type": "Corporate Law",
            "status": "active",
            "priority": "urgent",
            "description": "Acquisition of EuroRail Logistics by Global Logistics Systems Inc. Target valuation $150M. Currently in due diligence phase.",
            "clientId": created_clients[0]
        },
        {
            "title": "Thorne v. Metropolitan Health",
            "caseNumber": "CIV-2024-442",
            "type": "Personal Injury",
            "status": "active",
            "priority": "high",
            "description": "Professional negligence and breach of contract claim against Metropolitan Health System. Medical records discovery in progress.",
            "clientId": created_clients[1]
        },
        {
            "title": "IP Portfolio Defense - Q4",
            "caseNumber": "IP-NY-2024-012",
            "type": "Civil Law",
            "status": "active",
            "priority": "medium",
            "description": "Defense of streaming patents against unauthorized use by offshore entities. Multiple cease and desist orders pending.",
            "clientId": created_clients[2]
        },
        {
            "title": "Santoro Family Trust Restructuring",
            "caseNumber": "PR-IL-2024-991",
            "type": "Family Law",
            "status": "pending",
            "priority": "low",
            "description": "Comprehensive restructuring of the Santoro family multi-generational trust and estate plan for tax efficiency.",
            "clientId": created_clients[3]
        },
        {
            "title": "Zoning Appeal: Beacon North Project",
            "caseNumber": "RE-BO-2024-55",
            "type": "Real Estate Law",
            "status": "active",
            "priority": "high",
            "description": "Appealing the municipal board decision regarding setbacks and environmental impact for the North Shore development.",
            "clientId": created_clients[4]
        },
        {
            "title": "Sterling SEC Compliance Audit",
            "caseNumber": "SEC-2024-009",
            "type": "Criminal Law",
            "status": "review",
            "priority": "urgent",
            "description": "Internal audit and response preparation for the SEC inquiry regarding Sterling Funds Q3 trade reports.",
            "clientId": created_clients[5]
        },
    ]

    created_cases = []
    for data in cases_data:
        case = Case.objects.create(**data)
        created_cases.append(case)
    print(f"✅ Established {len(created_cases)} high-stakes legal cases")

    # Real-feeling Reminders
    now = timezone.now()
    reminders_data = [
        {"title": "M&A Closing - Final Sign-off", "description": "Execute final share purchase agreements for EuroRail acquisition.", "dueDate": now + timedelta(days=2, hours=4), "location": "v.Tower Chicago, Executive Floor", "type": "deadline", "priority": "urgent", "caseId": created_cases[0]},
        {"title": "Deposition: Dr. Thorne", "description": "Preparation and actual deposition of Dr. Thorne via Zoom link.", "dueDate": now + timedelta(days=5, hours=1), "location": "Zoom / Conference Room B", "type": "hearing", "priority": "high", "caseId": created_cases[1]},
        {"title": "IP Tribunal Initial Filing", "description": "Submit initial evidence package to the New York IP Protection Board.", "dueDate": now + timedelta(days=1, hours=8), "location": "NY District Office", "type": "filing", "priority": "urgent", "caseId": created_cases[2]},
        {"title": "Mediation: Santoro Family", "description": "Structured mediation between family beneficiaries and trust administrators.", "dueDate": now + timedelta(days=10), "location": "Santoro Residence", "type": "meeting", "priority": "medium", "caseId": created_cases[3]},
        {"title": "Beacon Hill Board of Appeals", "description": "Present site plan modifications to the Boston Zoning Board.", "dueDate": now + timedelta(days=12, hours=5), "location": "Boston City Hall", "type": "hearing", "priority": "high", "caseId": created_cases[4]},
        {"title": "SEC Response Draft Review", "description": "Review final draft of the response letter before sending to federal investigators.", "dueDate": now + timedelta(days=3), "location": "Partner Office", "type": "deadline", "priority": "urgent", "caseId": created_cases[5]},
        {"title": "Riverside Med Compliance Review", "description": "Bi-annual review of hospital risk management protocols.", "dueDate": now + timedelta(days=20), "location": "Riverside Admin Office", "type": "meeting", "priority": "low", "caseId": None},
        {"title": "Horizon VP Strategy Dinner", "description": "Discuss future deal pipeline and regulatory changes in Silicon Valley.", "dueDate": now + timedelta(days=7, hours=3), "location": "The Ritz-Carlton SF", "type": "meeting", "priority": "medium", "caseId": None},
    ]

    for data in reminders_data:
        Reminder.objects.create(**data)
    print(f"✅ Scheduled {len(reminders_data)} critical legal actions")

if __name__ == "__main__":
    seed()
    print("\n🚀 Database refined with professional legal data successfully!")
