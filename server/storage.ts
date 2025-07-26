import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import { users, clients, cases, reminders, type User, type InsertUser, type Client, type InsertClient, type Case, type InsertCase, type Reminder, type InsertReminder, type CaseWithClient, type ReminderWithCase, type DashboardStats } from "@shared/schema";

// Initialize database connection with error handling
let db: any = null;
let isDbConnected = false;

try {
  if (process.env.DATABASE_URL) {
    const sql = postgres(process.env.DATABASE_URL, {
      connect_timeout: 10, // 10 second timeout
      idle_timeout: 20,
      max_lifetime: 60 * 30 // 30 minutes
    });
    db = drizzle(sql);
    isDbConnected = true;
    console.log("✅ Supabase database connection initialized");
  } else {
    console.log("⚠️ DATABASE_URL not found, will use in-memory storage");
  }
} catch (error) {
  console.error("❌ Failed to initialize database connection:", error);
  isDbConnected = false;
}

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

// In-memory storage as fallback
class MemStorage implements IStorage {
  private users: User[] = [];
  private clients: Client[] = [];
  private cases: Case[] = [];
  private reminders: Reminder[] = [];
  private nextId = 1;

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
            name: "John Smith",
            email: "john.smith@email.com",
            phone: "+1 (555) 234-5678",
            address: "123 Main St, Anytown, ST 12345",
            status: "active"
          },
          {
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
            phone: "+1 (555) 345-6789",
            address: "456 Oak Ave, Somewhere, ST 67890",
            status: "active"
          },
          {
            name: "Mike Wilson",
            email: "mike.wilson@email.com",
            phone: "+1 (555) 456-7890",
            address: "789 Pine Rd, Elsewhere, ST 54321",
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
            description: "Auto accident case with significant injuries",
            clientId: createdClients[0]?.id
          },
          {
            title: "Contract Dispute",
            caseNumber: "CD-2024-002",
            type: "Contract Law",
            status: "active",
            priority: "medium",
            description: "Breach of contract dispute",
            clientId: createdClients[1]?.id
          },
          {
            title: "Estate Planning",
            caseNumber: "EP-2024-003",
            type: "Estate Planning",
            status: "closed",
            priority: "low",
            description: "Will and trust preparation",
            clientId: createdClients[2]?.id
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
            title: "Client Meeting",
            description: "Initial consultation with new client",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            location: "Law Office Conference Room A",
            type: "meeting",
            priority: "high",
            completed: false,
            caseId: createdCases[0]?.id
          },
          {
            title: "Court Filing Deadline",
            description: "File motion for summary judgment",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            location: null,
            type: "deadline",
            priority: "high",
            completed: false,
            caseId: createdCases[1]?.id
          },
          {
            title: "Document Review",
            description: "Review contract documents for case",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            location: null,
            type: "task",
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

        console.log("✅ In-memory database initialized with sample data");
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

export class SupabaseStorage implements IStorage {
  private fallbackStorage: MemStorage;

  constructor() {
    this.fallbackStorage = new MemStorage();
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
      if (isDbConnected && db) {
        console.log("🔄 Initializing Supabase database...");
        // Test connection first
        await db.select({ count: count() }).from(users);
        
        // Check if demo user exists
        const existingUser = await this.getUserByUsername("demo_lawyer");
        if (!existingUser) {
          // Create demo user
          await db.insert(users).values({
            username: "demo_lawyer",
            password: "demo123",
            fullName: "Demo Lawyer",
            email: "demo@legalflow.com",
            phone: "+1 (555) 123-4567",
            barNumber: "BAR123456789",
            practiceAreas: "Personal Injury, Corporate Law, Estate Planning"
          }).onConflictDoNothing();

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

        for (const clientData of clientsData) {
          await db.insert(clients).values(clientData).onConflictDoNothing();
        }

        // Get created clients to reference in cases
        const createdClients = await db.select().from(clients).limit(3);

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

        for (const caseData of casesData) {
          if (caseData.clientId) {
            await db.insert(cases).values(caseData).onConflictDoNothing();
          }
        }

        // Get created cases to reference in reminders
        const createdCases = await db.select().from(cases).limit(3);

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
            await db.insert(reminders).values(reminderData).onConflictDoNothing();
          }
        }

        console.log("✅ Supabase database initialized with sample data");
        }
      } else {
        // Fall back to in-memory storage initialization
        console.log("🔄 Database not connected, falling back to in-memory storage...");
        isDbConnected = false;
        await this.fallbackStorage.initializeDatabase();
      }
    } catch (error) {
      console.error("❌ Database initialization failed, falling back to in-memory storage:", error);
      isDbConnected = false;
      await this.fallbackStorage.initializeDatabase();
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getUser(id);
    }
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user, falling back:", error);
      return this.fallbackStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getUserByUsername(username);
    }
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by username, falling back:", error);
      return this.fallbackStorage.getUserByUsername(username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.createUser(insertUser);
    }
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user, falling back:", error);
      return this.fallbackStorage.createUser(insertUser);
    }
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.updateUser(id, updates);
    }
    try {
      const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating user, falling back:", error);
      return this.fallbackStorage.updateUser(id, updates);
    }
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getClients();
    }
    try {
      return await db.select().from(clients).orderBy(desc(clients.createdAt));
    } catch (error) {
      console.error("Error getting clients, falling back:", error);
      return this.fallbackStorage.getClients();
    }
  }

  async getClient(id: number): Promise<Client | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getClient(id);
    }
    try {
      const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting client, falling back:", error);
      return this.fallbackStorage.getClient(id);
    }
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.createClient(insertClient);
    }
    try {
      const result = await db.insert(clients).values(insertClient).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating client, falling back:", error);
      return this.fallbackStorage.createClient(insertClient);
    }
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.updateClient(id, updates);
    }
    try {
      const result = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating client, falling back:", error);
      return this.fallbackStorage.updateClient(id, updates);
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.deleteClient(id);
    }
    try {
      const result = await db.delete(clients).where(eq(clients.id, id));
      return result.count > 0;
    } catch (error) {
      console.error("Error deleting client, falling back:", error);
      return this.fallbackStorage.deleteClient(id);
    }
  }

  // Case methods
  async getCases(): Promise<CaseWithClient[]> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getCases();
    }
    try {
      const result = await db
        .select({
          id: cases.id,
          title: cases.title,
          caseNumber: cases.caseNumber,
          type: cases.type,
          status: cases.status,
          priority: cases.priority,
          description: cases.description,
          clientId: cases.clientId,
          createdAt: cases.createdAt,
          updatedAt: cases.updatedAt,
          client: {
            id: clients.id,
            name: clients.name,
            email: clients.email,
            phone: clients.phone,
            address: clients.address,
            status: clients.status,
            createdAt: clients.createdAt,
          },
        })
        .from(cases)
        .leftJoin(clients, eq(cases.clientId, clients.id))
        .orderBy(desc(cases.createdAt));

      return result.map(row => ({
        ...row,
        client: row.client?.id ? row.client : undefined
      }));
    } catch (error) {
      console.error("Error getting cases, falling back:", error);
      return this.fallbackStorage.getCases();
    }
  }

  async getCase(id: number): Promise<CaseWithClient | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getCase(id);
    }
    try {
      const result = await db
        .select({
          id: cases.id,
          title: cases.title,
          caseNumber: cases.caseNumber,
          type: cases.type,
          status: cases.status,
          priority: cases.priority,
          description: cases.description,
          clientId: cases.clientId,
          createdAt: cases.createdAt,
          updatedAt: cases.updatedAt,
          client: {
            id: clients.id,
            name: clients.name,
            email: clients.email,
            phone: clients.phone,
            address: clients.address,
            status: clients.status,
            createdAt: clients.createdAt,
          },
        })
        .from(cases)
        .leftJoin(clients, eq(cases.clientId, clients.id))
        .where(eq(cases.id, id))
        .limit(1);

      if (!result[0]) return undefined;

      const row = result[0];
      return {
        ...row,
        client: row.client?.id ? row.client : undefined
      };
    } catch (error) {
      console.error("Error getting case, falling back:", error);
      return this.fallbackStorage.getCase(id);
    }
  }

  async getCasesByClient(clientId: number): Promise<Case[]> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getCasesByClient(clientId);
    }
    try {
      return await db.select().from(cases).where(eq(cases.clientId, clientId));
    } catch (error) {
      console.error("Error getting cases by client, falling back:", error);
      return this.fallbackStorage.getCasesByClient(clientId);
    }
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.createCase(insertCase);
    }
    try {
      const result = await db.insert(cases).values(insertCase).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating case, falling back:", error);
      return this.fallbackStorage.createCase(insertCase);
    }
  }

  async updateCase(id: number, updates: Partial<InsertCase>): Promise<Case | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.updateCase(id, updates);
    }
    try {
      const result = await db.update(cases)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(cases.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating case, falling back:", error);
      return this.fallbackStorage.updateCase(id, updates);
    }
  }

  async deleteCase(id: number): Promise<boolean> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.deleteCase(id);
    }
    try {
      const result = await db.delete(cases).where(eq(cases.id, id));
      return result.count > 0;
    } catch (error) {
      console.error("Error deleting case, falling back:", error);
      return this.fallbackStorage.deleteCase(id);
    }
  }

  // Reminder methods
  async getReminders(): Promise<ReminderWithCase[]> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getReminders();
    }
    try {
      const result = await db
        .select({
          id: reminders.id,
          title: reminders.title,
          description: reminders.description,
          dueDate: reminders.dueDate,
          location: reminders.location,
          type: reminders.type,
          priority: reminders.priority,
          completed: reminders.completed,
          caseId: reminders.caseId,
          createdAt: reminders.createdAt,
          case: {
            id: cases.id,
            title: cases.title,
            caseNumber: cases.caseNumber,
            type: cases.type,
            status: cases.status,
            priority: cases.priority,
            description: cases.description,
            clientId: cases.clientId,
            createdAt: cases.createdAt,
            updatedAt: cases.updatedAt,
          },
        })
        .from(reminders)
        .leftJoin(cases, eq(reminders.caseId, cases.id))
        .orderBy(asc(reminders.dueDate));

      return result.map(row => ({
        ...row,
        case: row.case?.id ? row.case : undefined
      }));
    } catch (error) {
      console.error("Error getting reminders, falling back:", error);
      return this.fallbackStorage.getReminders();
    }
  }

  async getReminder(id: number): Promise<ReminderWithCase | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getReminder(id);
    }
    try {
      const result = await db
        .select({
          id: reminders.id,
          title: reminders.title,
          description: reminders.description,
          dueDate: reminders.dueDate,
          location: reminders.location,
          type: reminders.type,
          priority: reminders.priority,
          completed: reminders.completed,
          caseId: reminders.caseId,
          createdAt: reminders.createdAt,
          case: {
            id: cases.id,
            title: cases.title,
            caseNumber: cases.caseNumber,
            type: cases.type,
            status: cases.status,
            priority: cases.priority,
            description: cases.description,
            clientId: cases.clientId,
            createdAt: cases.createdAt,
            updatedAt: cases.updatedAt,
          },
        })
        .from(reminders)
        .leftJoin(cases, eq(reminders.caseId, cases.id))
        .where(eq(reminders.id, id))
        .limit(1);

      if (!result[0]) return undefined;

      const row = result[0];
      return {
        ...row,
        case: row.case?.id ? row.case : undefined
      };
    } catch (error) {
      console.error("Error getting reminder, falling back:", error);
      return this.fallbackStorage.getReminder(id);
    }
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.createReminder(insertReminder);
    }
    try {
      const result = await db.insert(reminders).values(insertReminder).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating reminder, falling back:", error);
      return this.fallbackStorage.createReminder(insertReminder);
    }
  }

  async updateReminder(id: number, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.updateReminder(id, updates);
    }
    try {
      const result = await db.update(reminders).set(updates).where(eq(reminders.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating reminder, falling back:", error);
      return this.fallbackStorage.updateReminder(id, updates);
    }
  }

  async deleteReminder(id: number): Promise<boolean> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.deleteReminder(id);
    }
    try {
      const result = await db.delete(reminders).where(eq(reminders.id, id));
      return result.count > 0;
    } catch (error) {
      console.error("Error deleting reminder, falling back:", error);
      return this.fallbackStorage.deleteReminder(id);
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (!isDbConnected || !db) {
      return this.fallbackStorage.getDashboardStats();
    }
    try {
      const [totalCasesResult, activeCasesResult, totalClientsResult, pendingRemindersResult] = await Promise.all([
        db.select({ count: count() }).from(cases),
        db.select({ count: count() }).from(cases).where(eq(cases.status, 'active')),
        db.select({ count: count() }).from(clients),
        db.select({ count: count() }).from(reminders).where(and(eq(reminders.completed, false)))
      ]);

      return {
        totalCases: totalCasesResult[0]?.count || 0,
        activeCases: activeCasesResult[0]?.count || 0,
        totalClients: totalClientsResult[0]?.count || 0,
        pendingReminders: pendingRemindersResult[0]?.count || 0
      };
    } catch (error) {
      console.error("Error getting dashboard stats, falling back:", error);
      return this.fallbackStorage.getDashboardStats();
    }
  }
}

// Export the storage instance
export const storage = new SupabaseStorage();