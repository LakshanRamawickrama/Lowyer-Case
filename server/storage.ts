import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import { users, clients, cases, reminders, type User, type InsertUser, type Client, type InsertClient, type Case, type InsertCase, type Reminder, type InsertReminder, type CaseWithClient, type ReminderWithCase, type DashboardStats } from "@shared/schema";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

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

export class SupabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
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
            description: "Initial hearing for personal injury case",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: "Courthouse Room 204",
            type: "court",
            priority: "high",
            completed: false,
            caseId: createdCases[0]?.id
          },
          {
            title: "Client Meeting",
            description: "Contract review meeting with TechCorp",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            location: "Law Office Conference Room",
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
      }
    } catch (error) {
      console.error("Database initialization failed:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    try {
      return await db.select().from(clients).orderBy(desc(clients.createdAt));
    } catch (error) {
      console.error("Error getting clients:", error);
      return [];
    }
  }

  async getClient(id: number): Promise<Client | undefined> {
    try {
      const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting client:", error);
      return undefined;
    }
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    try {
      const result = await db.insert(clients).values(insertClient).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    try {
      const result = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating client:", error);
      return undefined;
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    try {
      const result = await db.delete(clients).where(eq(clients.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting client:", error);
      return false;
    }
  }

  // Case methods
  async getCases(): Promise<CaseWithClient[]> {
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
          }
        })
        .from(cases)
        .leftJoin(clients, eq(cases.clientId, clients.id))
        .orderBy(desc(cases.updatedAt));

      return result.map(row => ({
        ...row,
        client: row.client.id ? row.client : undefined
      }));
    } catch (error) {
      console.error("Error getting cases:", error);
      return [];
    }
  }

  async getCase(id: number): Promise<CaseWithClient | undefined> {
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
          }
        })
        .from(cases)
        .leftJoin(clients, eq(cases.clientId, clients.id))
        .where(eq(cases.id, id))
        .limit(1);

      if (result.length === 0) return undefined;
      
      const row = result[0];
      return {
        ...row,
        client: row.client.id ? row.client : undefined
      };
    } catch (error) {
      console.error("Error getting case:", error);
      return undefined;
    }
  }

  async getCasesByClient(clientId: number): Promise<Case[]> {
    try {
      return await db.select().from(cases).where(eq(cases.clientId, clientId));
    } catch (error) {
      console.error("Error getting cases by client:", error);
      return [];
    }
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    try {
      const result = await db.insert(cases).values(insertCase).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating case:", error);
      throw error;
    }
  }

  async updateCase(id: number, updates: Partial<InsertCase>): Promise<Case | undefined> {
    try {
      const result = await db.update(cases).set({ ...updates, updatedAt: new Date() }).where(eq(cases.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating case:", error);
      return undefined;
    }
  }

  async deleteCase(id: number): Promise<boolean> {
    try {
      const result = await db.delete(cases).where(eq(cases.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting case:", error);
      return false;
    }
  }

  // Reminder methods
  async getReminders(): Promise<ReminderWithCase[]> {
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
          }
        })
        .from(reminders)
        .leftJoin(cases, eq(reminders.caseId, cases.id))
        .orderBy(asc(reminders.dueDate));

      return result.map(row => ({
        ...row,
        case: row.case.id ? row.case : undefined
      }));
    } catch (error) {
      console.error("Error getting reminders:", error);
      return [];
    }
  }

  async getReminder(id: number): Promise<ReminderWithCase | undefined> {
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
          }
        })
        .from(reminders)
        .leftJoin(cases, eq(reminders.caseId, cases.id))
        .where(eq(reminders.id, id))
        .limit(1);

      if (result.length === 0) return undefined;
      
      const row = result[0];
      return {
        ...row,
        case: row.case.id ? row.case : undefined
      };
    } catch (error) {
      console.error("Error getting reminder:", error);
      return undefined;
    }
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    try {
      const result = await db.insert(reminders).values(insertReminder).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating reminder:", error);
      throw error;
    }
  }

  async updateReminder(id: number, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    try {
      const result = await db.update(reminders).set(updates).where(eq(reminders.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating reminder:", error);
      return undefined;
    }
  }

  async deleteReminder(id: number): Promise<boolean> {
    try {
      const result = await db.delete(reminders).where(eq(reminders.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      return false;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
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
        pendingReminders: pendingRemindersResult[0]?.count || 0,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalCases: 0,
        activeCases: 0,
        totalClients: 0,
        pendingReminders: 0,
      };
    }
  }
}

export const storage = new SupabaseStorage();