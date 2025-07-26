import { type User, type InsertUser, type Client, type InsertClient, type Case, type InsertCase, type Reminder, type InsertReminder, type CaseWithClient, type ReminderWithCase, type DashboardStats } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Case methods
  getCases(): Promise<CaseWithClient[]>;
  getCase(id: number): Promise<CaseWithClient | undefined>;
  getCasesByClient(clientId: number): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, updates: Partial<InsertCase>): Promise<Case | undefined>;
  deleteCase(id: number): Promise<boolean>;
  
  // Reminder methods
  getReminders(): Promise<ReminderWithCase[]>;
  getReminder(id: number): Promise<ReminderWithCase | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, updates: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
  
  // Database initialization
  initializeDatabase(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private clients: Client[] = [];
  private cases: Case[] = [];
  private reminders: Reminder[] = [];
  private nextId = 1;

  constructor() {
    this.initializeDatabase();
  }

  private generateId(): number {
    return this.nextId++;
  }

  async initializeDatabase(): Promise<void> {
    try {
      // Check if demo user exists
      const existingUser = await this.getUserByUsername("demo_lawyer");
      if (!existingUser) {
        // Create demo user
        const demoUser: User = {
          id: this.generateId(),
          username: "demo_lawyer",
          password: "demo123",
          fullName: "Demo Lawyer",
          email: "demo@legalflow.com",
          phone: "+1 (555) 123-4567",
          barNumber: "BAR123456789",
          practiceAreas: "Personal Injury, Corporate Law, Estate Planning",
          createdAt: new Date()
        };
        this.users.push(demoUser);

        // Create sample clients
        const clientsData = [
          {
            name: "Sarah Johnson",
            email: "sarah.johnson@email.com",
            phone: "+1 (555) 123-4567",
            address: "123 Main St, City, State 12345",
            status: "active"
          },
          {
            name: "Robert Miller",
            email: "robert.miller@email.com",
            phone: "+1 (555) 987-6543",
            address: "456 Oak Ave, City, State 12345",
            status: "active"
          },
          {
            name: "TechCorp Ltd.",
            email: "contact@techcorp.com",
            phone: "+1 (555) 456-7890",
            address: "789 Business Blvd, City, State 12345",
            status: "active"
          }
        ];

        const createdClients: Client[] = [];
        for (const clientData of clientsData) {
          const client: Client = {
            id: this.generateId(),
            ...clientData,
            createdAt: new Date()
          };
          this.clients.push(client);
          createdClients.push(client);
        }

        // Create sample cases
        const casesData = [
          {
            title: "Personal Injury Claim",
            caseNumber: "PI-2024-001",
            type: "Personal Injury",
            status: "active",
            priority: "high",
            description: "Slip and fall incident at local grocery store",
            clientId: createdClients[0]?.id
          },
          {
            title: "Corporate Contract Review",
            caseNumber: "CR-2024-002",
            type: "Corporate Law",
            status: "active",
            priority: "medium",
            description: "Review and negotiation of service agreement",
            clientId: createdClients[2]?.id
          },
          {
            title: "Estate Planning",
            caseNumber: "EP-2024-003",
            type: "Estate Planning",
            status: "pending",
            priority: "low",
            description: "Will and trust preparation",
            clientId: createdClients[1]?.id
          }
        ];

        const createdCases: Case[] = [];
        for (const caseData of casesData) {
          if (caseData.clientId) {
            const newCase: Case = {
              id: this.generateId(),
              ...caseData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            this.cases.push(newCase);
            createdCases.push(newCase);
          }
        }

        // Create sample reminders
        const remindersData = [
          {
            title: "Court Hearing",
            description: "Personal injury case hearing",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: "Courthouse Room 101",
            type: "hearing",
            priority: "high",
            completed: false,
            caseId: createdCases[0]?.id
          },
          {
            title: "Client Meeting",
            description: "Contract review meeting with client",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            type: "meeting",
            priority: "medium",
            completed: false,
            caseId: createdCases[1]?.id
          },
          {
            title: "Document Deadline",
            description: "Submit estate planning documents",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            type: "deadline",
            priority: "medium",
            completed: false,
            caseId: createdCases[2]?.id
          }
        ];

        for (const reminderData of remindersData) {
          if (reminderData.caseId) {
            const reminder: Reminder = {
              id: this.generateId(),
              title: reminderData.title,
              description: reminderData.description,
              dueDate: reminderData.dueDate,
              location: reminderData.location || null,
              type: reminderData.type,
              priority: reminderData.priority,
              completed: reminderData.completed,
              caseId: reminderData.caseId,
              createdAt: new Date()
            };
            this.reminders.push(reminder);
          }
        }
      }
    } catch (error) {
      console.error("Database initialization failed:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName || null,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      barNumber: insertUser.barNumber || null,
      practiceAreas: insertUser.practiceAreas || null,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return [...this.clients].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.find(client => client.id === id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const newClient: Client = {
      id: this.generateId(),
      name: insertClient.name,
      email: insertClient.email || null,
      phone: insertClient.phone || null,
      address: insertClient.address || null,
      status: insertClient.status || "active",
      createdAt: new Date()
    };
    this.clients.push(newClient);
    return newClient;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) return undefined;
    
    this.clients[clientIndex] = { ...this.clients[clientIndex], ...updates };
    return this.clients[clientIndex];
  }

  async deleteClient(id: number): Promise<boolean> {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) return false;
    
    this.clients.splice(clientIndex, 1);
    return true;
  }

  // Case methods
  async getCases(): Promise<CaseWithClient[]> {
    return this.cases.map(caseItem => ({
      ...caseItem,
      client: caseItem.clientId ? this.clients.find(c => c.id === caseItem.clientId) : undefined
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCase(id: number): Promise<CaseWithClient | undefined> {
    const caseItem = this.cases.find(c => c.id === id);
    if (!caseItem) return undefined;
    
    return {
      ...caseItem,
      client: caseItem.clientId ? this.clients.find(c => c.id === caseItem.clientId) : undefined
    };
  }

  async getCasesByClient(clientId: number): Promise<Case[]> {
    return this.cases.filter(c => c.clientId === clientId);
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    const newCase: Case = {
      id: this.generateId(),
      title: insertCase.title,
      caseNumber: insertCase.caseNumber || null,
      type: insertCase.type,
      status: insertCase.status || "active",
      priority: insertCase.priority || "medium",
      description: insertCase.description || null,
      clientId: insertCase.clientId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cases.push(newCase);
    return newCase;
  }

  async updateCase(id: number, updates: Partial<InsertCase>): Promise<Case | undefined> {
    const caseIndex = this.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) return undefined;
    
    this.cases[caseIndex] = { 
      ...this.cases[caseIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    return this.cases[caseIndex];
  }

  async deleteCase(id: number): Promise<boolean> {
    const caseIndex = this.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) return false;
    
    this.cases.splice(caseIndex, 1);
    return true;
  }

  // Reminder methods
  async getReminders(): Promise<ReminderWithCase[]> {
    return this.reminders.map(reminder => ({
      ...reminder,
      case: reminder.caseId ? this.cases.find(c => c.id === reminder.caseId) : undefined
    })).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async getReminder(id: number): Promise<ReminderWithCase | undefined> {
    const reminder = this.reminders.find(r => r.id === id);
    if (!reminder) return undefined;
    
    return {
      ...reminder,
      case: reminder.caseId ? this.cases.find(c => c.id === reminder.caseId) : undefined
    };
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const newReminder: Reminder = {
      id: this.generateId(),
      title: insertReminder.title,
      description: insertReminder.description || null,
      dueDate: insertReminder.dueDate,
      location: insertReminder.location || null,
      type: insertReminder.type || "general",
      priority: insertReminder.priority || "medium",
      completed: insertReminder.completed || false,
      caseId: insertReminder.caseId || null,
      createdAt: new Date()
    };
    this.reminders.push(newReminder);
    return newReminder;
  }

  async updateReminder(id: number, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) return undefined;
    
    this.reminders[reminderIndex] = { ...this.reminders[reminderIndex], ...updates };
    return this.reminders[reminderIndex];
  }

  async deleteReminder(id: number): Promise<boolean> {
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) return false;
    
    this.reminders.splice(reminderIndex, 1);
    return true;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const totalCases = this.cases.length;
    const activeCases = this.cases.filter(c => c.status === 'active').length;
    const totalClients = this.clients.length;
    const pendingReminders = this.reminders.filter(r => !r.completed && r.dueDate > new Date()).length;

    return {
      totalCases,
      activeCases,
      totalClients,
      pendingReminders
    };
  }
}

// Export the storage instance
export const storage = new MemStorage();